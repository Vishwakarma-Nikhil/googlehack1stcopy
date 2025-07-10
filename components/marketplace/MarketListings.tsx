import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import { Typography } from '../Typography'
import { Card } from '../Card'
import { Plus, DollarSign, Tag, Edit, X, ChevronDown, ChevronUp } from 'react-native-feather'
import { useUserStore } from '../../store/userStore'

type Listing = {
  $id: string
  crop_type: string
  price_per_kg: number
  total_quantity: number
  available_quantity: number
  status: string
  farmer_id: string
  $createdAt: string
  $updatedAt: string
}

type Bid = {
  $id: string
  quantity: number
  price_per_kg: number
  listing_id: string
  buyer_id: string
  status: string
  $createdAt: string
  $updatedAt: string
}

// Fix API_BASE_URL to ensure consistent format without trailing slash
const API_BASE_URL = 'https://ad17-124-66-175-46.ngrok-free.app'; // Removed trailing slash
const LANGUAGE = 'english';

const MarketListings = () => {
  const { colors, spacing, radius } = useTheme()
  const { user } = useUserStore() // Get user from userStore
  const userEmail = user?.email || '' // Get email from user or empty string
  const userRole = user?.role || '' // Get role to check if user is a farmer
  
  const [listings, setListings] = useState<Listing[]>([])
  const [bids, setBids] = useState<{[key: string]: Bid[]}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedListings, setExpandedListings] = useState<Set<string>>(new Set()) // Track expanded bids
  const [formData, setFormData] = useState({
    crop_type: '',
    price_per_kg: '',
    total_quantity: ''
  })

  // Fetch farmer's listings
  useEffect(() => {
    const fetchListings = async () => {
      // Check if user is logged in and is a farmer
      if (!userEmail) {
        setError('No user email available. Please login again.')
        setLoading(false)
        return
      }
      
      if (userRole !== 'farmer') {
        setError('Only farmers can view and manage listings.')
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        setError(null) // Clear any previous errors
        
        console.log(`Fetching listings for ${userEmail}`)
        const response = await fetch(`${API_BASE_URL}/listing?email=${encodeURIComponent(userEmail)}&type=listed&language=${LANGUAGE}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }))
          throw new Error(errorData.message || `Failed to fetch listings (${response.status})`)
        }
        
        const data = await response.json()
        console.log('Listings response:', data)
        
        if (data && data.documents) {
          setListings(data.documents)
          
          // Fetch bids for each listing
          data.documents.forEach((listing: Listing) => {
            fetchBidsForListing(listing.$id)
          })
        } else {
          console.log('No listings found or invalid response format')
          setListings([])
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching listings:', error)
        setError(error instanceof Error ? error.message : 'An unknown error occurred')
        setLoading(false)
      }
    }
    
    fetchListings()
  }, [userEmail, userRole]) // Re-fetch when userEmail or userRole changes
  
  const fetchBidsForListing = async (listingId: string) => {
    if (!userEmail || !listingId) return
    
    try {
      console.log(`Fetching bids for listing ${listingId}`)
      const response = await fetch(`${API_BASE_URL}/bids?email=${encodeURIComponent(userEmail)}&listing_id=${encodeURIComponent(listingId)}&language=${LANGUAGE}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }))
        throw new Error(errorData.message || `Failed to fetch bids for listing ${listingId} (${response.status})`)
      }
      
      const data = await response.json()
      console.log(`Bids for listing ${listingId}:`, data)
      
      if (data && data.documents) {
        setBids(prev => ({
          ...prev,
          [listingId]: data.documents
        }))
      }
    } catch (error) {
      console.error(`Error fetching bids for listing ${listingId}:`, error)
      // Don't set global error for individual bid fetch failures
    }
  }
  
  const handleCreateListing = async () => {
    if (!userEmail) {
      Alert.alert('Error', 'You must be logged in to create a listing')
      return
    }
    
    if (userRole !== 'farmer') {
      Alert.alert('Error', 'Only farmers can create listings')
      return
    }
    
    try {
      // Validate form inputs
      if (!formData.crop_type || !formData.price_per_kg || !formData.total_quantity) {
        Alert.alert('Error', 'All fields are required')
        return
      }
      
      // Validate numeric inputs
      const price = parseFloat(formData.price_per_kg)
      const quantity = parseFloat(formData.total_quantity)
      
      if (isNaN(price) || price <= 0) {
        Alert.alert('Error', 'Price must be a positive number')
        return
      }
      
      if (isNaN(quantity) || quantity <= 0) {
        Alert.alert('Error', 'Quantity must be a positive number')
        return
      }
      
      setLoading(true)
      setError(null)
      
      console.log('Creating new listing with data:', {
        crop_type: formData.crop_type,
        price_per_kg: price,
        total_quantity: quantity
      })
      
      const response = await fetch(`${API_BASE_URL}/listing?email=${encodeURIComponent(userEmail)}&language=${LANGUAGE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_type: formData.crop_type,
          price_per_kg: price,
          total_quantity: quantity
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }))
        throw new Error(errorData.message || `Failed to create listing (${response.status})`)
      }
      
      const data = await response.json()
      console.log('Listing created:', data)
      
      // Add the new listing to the state
      setListings([...listings, data])
      setFormData({ crop_type: '', price_per_kg: '', total_quantity: '' })
      setShowAddForm(false)
      
      Alert.alert('Success', 'Listing created successfully')
      setLoading(false)
    } catch (error) {
      console.error('Error creating listing:', error)
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create listing. Please try again later.')
      setLoading(false)
    }
  }
  
  const handleCancelListing = async (listingId: string) => {
    if (!userEmail) return
    
    try {
      setLoading(true)
      setError(null)
      
      console.log(`Cancelling listing ${listingId}`)
      const response = await fetch(`${API_BASE_URL}/listing/${encodeURIComponent(listingId)}?email=${encodeURIComponent(userEmail)}&language=${LANGUAGE}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }))
        throw new Error(errorData.message || `Failed to cancel listing (${response.status})`)
      }
      
      const data = await response.json()
      console.log('Listing cancelled response:', data)
      
      // Update local state - it will now be marked as cancelled
      setListings(listings.map(listing => 
        listing.$id === listingId ? { ...listing, status: 'cancelled' } : listing
      ))
      
      Alert.alert('Success', 'Listing cancelled successfully')
    } catch (error) {
      console.error('Error cancelling listing:', error)
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to cancel listing. Please try again later.')
    } finally {
      setLoading(false) // Always ensure loading is set to false
    }
  }
  
  const handleAcceptBid = async (listingId: string, bidId: string) => {
    if (!userEmail) return
    
    try {
      setLoading(true)
      setError(null)
      
      console.log(`Accepting bid ${bidId} for listing ${listingId}`)
      const response = await fetch(`${API_BASE_URL}/bids/${encodeURIComponent(bidId)}/accept?email=${encodeURIComponent(userEmail)}&language=${LANGUAGE}`, {
        method: 'PATCH'
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }))
        throw new Error(errorData.message || `Failed to accept bid (${response.status})`)
      }
      
      const data = await response.json()
      console.log('Bid accepted response:', data)
      
      // Update local state with the accepted bid
      setBids(prev => ({
        ...prev,
        [listingId]: prev[listingId]?.map(bid => 
          bid.$id === bidId ? { ...bid, status: 'accepted' } : bid
        ) || []
      }))
      
      Alert.alert('Success', 'Bid accepted successfully')
    } catch (error) {
      console.error('Error accepting bid:', error)
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to accept bid. Please try again later.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleRejectBid = async (listingId: string, bidId: string) => {
    if (!userEmail) return
    
    try {
      setLoading(true)
      setError(null)
      
      console.log(`Rejecting bid ${bidId} for listing ${listingId}`)
      const response = await fetch(`${API_BASE_URL}/bids/${encodeURIComponent(bidId)}/reject?email=${encodeURIComponent(userEmail)}&language=${LANGUAGE}`, {
        method: 'PATCH'
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }))
        throw new Error(errorData.message || `Failed to reject bid (${response.status})`)
      }
      
      const data = await response.json()
      console.log('Bid rejected response:', data)
      
      // Update local state with the rejected bid
      setBids(prev => ({
        ...prev,
        [listingId]: prev[listingId]?.map(bid => 
          bid.$id === bidId ? { ...bid, status: 'rejected' } : bid
        ) || []
      }))
      
      Alert.alert('Success', 'Bid rejected successfully')
    } catch (error) {
      console.error('Error rejecting bid:', error)
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to reject bid. Please try again later.')
    } finally {
      setLoading(false)
    }
  }
  
  const toggleBidsExpansion = (listingId: string) => {
    setExpandedListings(prev => {
      const newSet = new Set(prev)
      if (newSet.has(listingId)) {
        newSet.delete(listingId)
      } else {
        newSet.add(listingId)
      }
      return newSet
    })
  }

  const renderBid = (bid: Bid, listingId: string) => (
    <View key={bid.$id} style={[styles.bidItem, { borderColor: colors.border }]}>
      <View>
        <Typography variant="body">
          {bid.quantity}kg at ₹{bid.price_per_kg}/kg
        </Typography>
        <Typography variant="small" color="textSecondary">
          Total: ₹{bid.quantity * bid.price_per_kg}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Status: {bid.status}
        </Typography>
      </View>
      
      {bid.status === 'pending' && (
        <View style={styles.bidActions}>
          <TouchableOpacity 
            style={[styles.bidActionButton, styles.acceptButton, { backgroundColor: colors.success }]}
            onPress={() => handleAcceptBid(listingId, bid.$id)}
          >
            <Typography variant="small" style={styles.actionButtonText}>Accept</Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.bidActionButton, styles.rejectButton, { backgroundColor: colors.error }]}
            onPress={() => handleRejectBid(listingId, bid.$id)}
          >
            <Typography variant="small" style={styles.actionButtonText}>Reject</Typography>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
  
  const renderListing = ({ item }: { item: Listing }) => {
    const isExpanded = expandedListings.has(item.$id)
    const listingBids = bids[item.$id] || []
    const bidCount = listingBids.length

    return (
      <Card variant="elevated" style={styles.listingCard}>
        <View style={styles.listingHeader}>
          <View style={styles.listingTitleSection}>
            <Typography variant="bodyLarge">{item.crop_type}</Typography>
            <View style={[styles.statusBadge, { 
              backgroundColor: item.status === 'listed' ? colors.success + '20' : colors.error + '20',
            }]}>
              <Typography variant="small" color={item.status === 'listed' ? 'success' : 'error'}>
                {item.status}
              </Typography>
            </View>
          </View>
          
          {item.status === 'listed' && (
            <TouchableOpacity 
              style={[styles.cancelButton, { borderColor: colors.error }]}
              onPress={() => handleCancelListing(item.$id)}
            >
              <X width={16} height={16} stroke={colors.error} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.listingDetails}>
          <View style={styles.detailRow}>
            <Typography variant="body">Price:</Typography>
            <Typography variant="body">₹{item.price_per_kg}/kg</Typography>
          </View>
          <View style={styles.detailRow}>
            <Typography variant="body">Total Quantity:</Typography>
            <Typography variant="body">{item.total_quantity}kg</Typography>
          </View>
          <View style={styles.detailRow}>
            <Typography variant="body">Available:</Typography>
            <Typography variant="body">{item.available_quantity}kg</Typography>
          </View>
        </View>
        
        {/* Collapsible Bids Section */}
        <TouchableOpacity 
          style={[styles.bidsToggle, { borderColor: colors.border }]}
          onPress={() => toggleBidsExpansion(item.$id)}
          activeOpacity={0.7}
        >
          <View style={styles.bidsToggleContent}>
            <Typography variant="body" style={styles.bidsToggleText}>
              {bidCount > 0 ? `Bids (${bidCount})` : 'No bids yet'}
            </Typography>
            {bidCount > 0 && (
              isExpanded ? 
                <ChevronUp width={20} height={20} stroke={colors.textSecondary} /> :
                <ChevronDown width={20} height={20} stroke={colors.textSecondary} />
            )}
          </View>
        </TouchableOpacity>
        
        {/* Expanded Bids Content */}
        {isExpanded && bidCount > 0 && (
          <View style={[styles.bidsSection, { borderColor: colors.border }]}>
            {listingBids.map(bid => renderBid(bid, item.$id))}
          </View>
        )}
      </Card>
    )
  }
  
  const renderAddForm = () => (
    <Card variant="elevated" style={styles.formCard}>
      <Typography variant="bodyLarge" style={styles.formTitle}>Create New Listing</Typography>
      
      <View style={styles.formField}>
        <Typography variant="body">Crop Type</Typography>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
            color: colors.text
          }]}
          value={formData.crop_type}
          onChangeText={text => setFormData({...formData, crop_type: text})}
          placeholder="e.g., Wheat, Rice, etc."
          placeholderTextColor={colors.textSecondary}
        />
      </View>
      
      <View style={styles.formField}>
        <Typography variant="body">Price per kg (₹)</Typography>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
            color: colors.text
          }]}
          value={formData.price_per_kg}
          onChangeText={text => setFormData({...formData, price_per_kg: text})}
          placeholder="e.g., 20.00"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.formField}>
        <Typography variant="body">Total Quantity (kg)</Typography>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
            color: colors.text
          }]}
          value={formData.total_quantity}
          onChangeText={text => setFormData({...formData, total_quantity: text})}
          placeholder="e.g., 100.00"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.formButtons}>
        <TouchableOpacity 
          style={[styles.formButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => setShowAddForm(false)}
        >
          <Typography variant="body">Cancel</Typography>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.formButton, { backgroundColor: colors.primary }]}
          onPress={handleCreateListing}
        >
          <Typography variant="body" color="primary">Create</Typography>
        </TouchableOpacity>
      </View>
    </Card>
  )

  return (
    <View style={styles.container}>
      {!userEmail ? (
        <View style={styles.noUserContainer}>
          <Typography variant="bodyLarge" style={styles.noUserText}>
            Please log in to view your listings
          </Typography>
        </View>
      ) : userRole !== 'farmer' ? (
        <View style={styles.noUserContainer}>
          <Typography variant="bodyLarge" style={styles.noUserText}>
            Only farmers can view and manage crop listings
          </Typography>
        </View>
      ) : (
        <>
          <View style={styles.headerActions}>
            <Typography variant="bodyLarge">My Crop Listings</Typography>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddForm(true)}
              disabled={loading}
            >
              <Plus width={20} height={20} stroke="white" />
              <Typography variant="body" color="textSecondary" style={[styles.addButtonText, { color: 'white' }]}>
                New Listing
              </Typography>
            </TouchableOpacity>
          </View>
          
          {showAddForm && renderAddForm()}
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Typography variant="body" style={styles.loadingText}>Loading...</Typography>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Typography variant="body" style={styles.errorText}>Error: {error}</Typography>
              <TouchableOpacity 
                style={[styles.retryButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setError(null)
                  setLoading(true)
                  // Re-fetch listings
                  const fetchListings = async () => {
                    try {
                      const response = await fetch(`${API_BASE_URL}/listing?email=${encodeURIComponent(userEmail)}&type=listed&language=${LANGUAGE}`)
                      
                      if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }))
                        throw new Error(errorData.message || `Failed to fetch listings (${response.status})`)
                      }
                      
                      const data = await response.json()
                      
                      if (data && data.documents) {
                        setListings(data.documents)
                        
                        // Fetch bids for each listing
                        data.documents.forEach((listing: Listing) => {
                          fetchBidsForListing(listing.$id)
                        })
                      } else {
                        setListings([])
                      }
                      
                      setLoading(false)
                    } catch (error) {
                      console.error('Error fetching listings:', error)
                      setError(error instanceof Error ? error.message : 'An unknown error occurred')
                      setLoading(false)
                    }
                  }
                  
                  fetchListings()
                }}
              >
                <Typography variant="body" color="accent">Retry</Typography>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={listings}
              renderItem={renderListing}
              keyExtractor={(item) => item.$id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <Typography variant="body" style={styles.emptyText}>
                  You don't have any listings yet
                </Typography>
              }
              refreshing={loading}
              onRefresh={() => {
                setLoading(true)
                // Re-fetch listings
                const fetchListings = async () => {
                  try {
                    const response = await fetch(`${API_BASE_URL}/listing?email=${encodeURIComponent(userEmail)}&type=listed&language=${LANGUAGE}`)
                    
                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }))
                      throw new Error(errorData.message || `Failed to fetch listings (${response.status})`)
                    }
                    
                    const data = await response.json()
                    
                    if (data && data.documents) {
                      setListings(data.documents)
                      
                      // Fetch bids for each listing
                      data.documents.forEach((listing: Listing) => {
                        fetchBidsForListing(listing.$id)
                      })
                    } else {
                      setListings([])
                    }
                    
                    setLoading(false)
                  } catch (error) {
                    console.error('Error fetching listings:', error)
                    setError(error instanceof Error ? error.message : 'An unknown error occurred')
                    setLoading(false)
                  }
                }
                
                fetchListings()
              }}
            />
          )}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    marginLeft: 8,
  },
  listContainer: {
    paddingBottom: 80,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
  },
  listingCard: {
    marginBottom: 16,
    padding: 16,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listingTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bidsToggle: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  bidsToggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidsToggleText: {
    fontWeight: '500',
  },
  bidsSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  bidItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingRight: 8,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  bidActions: {
    flexDirection: 'row',
    marginLeft: 4,
  },
  bidActionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 4,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  rejectButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  noBidsText: {
    marginTop: 12,
    textAlign: 'center',
  },
  formCard: {
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  formField: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  formButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
  noUserContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noUserText: {
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
})

export default MarketListings
