'use client'
import Image from "next/image";
import { useState, useEffect } from "react"
import { firestore } from "@/firebase"
import { Box, Button, Modal, Stack, TextField, Typography, Autocomplete } from "@mui/material"
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from "firebase/firestore"
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs"
import { GoHistory } from "react-icons/go"

export default function Home() {
  // State management for inventory items, modal visibility, and new item name
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [language, setLanguage] = useState('en')
  const [itemName, setItemName] = useState("")
  const [itemQuantity, setItemQuantity] = useState("")
  const [roomLocation, setRoomLocation] = useState("")
  const [boxNumber, setBoxNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [originalName, setOriginalName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [selectedItemHistory, setSelectedItemHistory] = useState(null)
  const { user } = useUser()

  const roomLocations = [
    "Big Classroom (Pixel Place)",
    "Breakout Room",
    "Computer Lab (Bot Spot)",
    "Hub",
    "Kitchen",
    "Maker Space"
  ]

  // Function to fetch and update the inventory from Firebase
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  // Add a new item or update if item exists
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)

    const itemData = {
      quantity: itemQuantity === "MANY" ? "MANY" : parseInt(itemQuantity),
      roomLocation: roomLocation,
      boxNumber: boxNumber,
      notes: notes,
      lastModified: new Date().toISOString()
    }

    await setDoc(docRef, itemData)

    // Add history entry
    const historyRef = doc(collection(firestore, `inventory/${item}/history`), new Date().toISOString())
    await setDoc(historyRef, {
      action: docSnap.exists() ? "update" : "create",
      by: user.fullName || user.username,
      timestamp: new Date().toISOString(),
      changes: itemData
    })

    // Reset form fields
    setItemName("")
    setItemQuantity("")
    setRoomLocation("")
    setBoxNumber("")
    setNotes("")

    await updateInventory()
  }

  // Function to delete an entire entry
  const deleteEntry = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item.name)
    await deleteDoc(docRef)
    await updateInventory()
    setDeleteConfirmOpen(false)
    setItemToDelete(null)
  }

  // Fetch inventory data when component mounts
  useEffect(() => {
    updateInventory()
  }, [])

  // Modal control functions
  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setIsEditing(false)
    setItemName("")
    setItemQuantity("")
    setRoomLocation("")
    setBoxNumber("")
    setNotes("")
    setOriginalName("")
  }

  const handleEdit = (item) => {
    setItemName(item.name)
    setItemQuantity(item.quantity)
    setRoomLocation(item.roomLocation)
    setBoxNumber(item.boxNumber || "")
    setNotes(item.notes || "")
    setOriginalName(item.name)
    setIsEditing(true)
    setOpen(true)
  }

  const handleSave = async () => {
    const itemData = {
      quantity: itemQuantity,
      roomLocation: roomLocation,
      boxNumber: boxNumber,
      notes: notes,
      lastModified: new Date().toISOString()
    }

    if (isEditing) {
      // Delete the old document if name changed
      if (originalName !== itemName) {
        const oldDocRef = doc(collection(firestore, "inventory"), originalName)
        await deleteDoc(oldDocRef)
        
        // Add history entry for deletion of old name
        const oldHistoryRef = doc(collection(firestore, `inventory/${originalName}/history`), new Date().toISOString())
        await setDoc(oldHistoryRef, {
          action: "rename",
          by: user.fullName || user.username,
          timestamp: new Date().toISOString(),
          newName: itemName
        })
      }
    }

    // Add/Update the item
    const docRef = doc(collection(firestore, "inventory"), itemName)
    await setDoc(docRef, itemData)

    // Add history entry
    const historyRef = doc(collection(firestore, `inventory/${itemName}/history`), new Date().toISOString())
    await setDoc(historyRef, {
      action: isEditing ? "update" : "create",
      by: user.fullName || user.username,
      timestamp: new Date().toISOString(),
      changes: itemData
    })

    handleClose()
    await updateInventory()
  }

  const handleDeleteConfirm = (item) => {
    setItemToDelete(item)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false)
    setItemToDelete(null)
  }

  const handleHelpClose = () => setHelpModalOpen(false)

  const handleHistoryClick = async (item) => {
    const historyRef = collection(firestore, `inventory/${item.name}/history`)
    const historySnapshot = await getDocs(historyRef)
    const history = []
    historySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      })
    })
    setSelectedItemHistory({ name: item.name, history: history.sort((a, b) => b.timestamp.localeCompare(a.timestamp)) })
    setHistoryModalOpen(true)
  }

  const handleHistoryClose = () => {
    setHistoryModalOpen(false)
    setSelectedItemHistory(null)
  }

  // Add sorting function
  const getSortedInventory = (items) => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "room":
          return a.roomLocation.localeCompare(b.roomLocation)
        case "quantity":
          // Handle "MANY" case and convert to numbers for comparison
          if (a.quantity === "MANY" && b.quantity === "MANY") return 0
          if (a.quantity === "MANY") return 1
          if (b.quantity === "MANY") return -1
          return parseInt(a.quantity) - parseInt(b.quantity)
        case "recent":
          // Sort by lastModified timestamp, most recent first
          const dateA = a.lastModified ? new Date(a.lastModified) : new Date(0)
          const dateB = b.lastModified ? new Date(b.lastModified) : new Date(0)
          return dateB - dateA
        default:
          return 0
      }
    })
  }

  return (
    <Box
      width="100%"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      sx={{
        overflowY: 'auto',
        pb: 8, // Add padding at bottom to account for help button
      }}
    >
      {/* Logo - shown for both authenticated and unauthenticated users */}
      <Box mt={4} mb={4} display="flex" justifyContent="center">
        <Image
          src="/stem-heroes-logo.png"
          alt="STEM Heroes Academy Logo"
          width={274}
          height={189}
          priority
        />
      </Box>

      {/* Show login message for unauthenticated users */}
      <SignedOut>
        <Typography variant="h5" textAlign="center">
          Please sign in to access the inventory
        </Typography>
      </SignedOut>

      {/* Show inventory for authenticated users */}
      <SignedIn>
        {/* Help Button */}
        <Button
          variant="contained"
          onClick={() => setHelpModalOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            borderRadius: '50%',
            minWidth: '40px',
            width: '40px',
            height: '40px',
            padding: 0,
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            }
          }}
        >
          ?
        </Button>

        {/* Help Modal */}
        <Modal open={helpModalOpen} onClose={handleHelpClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={600}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: "translate(-50%, -50%)"
            }}
          >
            <Typography variant="h5" textAlign="center">Tutorial</Typography>
            <Stack spacing={2}>
              <Typography variant="h6">Adding Items</Typography>
              <Typography>
                1. Click the &quot;Add New Item&quot; button
                <br />
                2. Fill in the item details:
                <br />
                - Item Name
                <br />
                - Quantity
                <br />
                - Room Location
                <br />
                - Box Number (optional)
                <br />
                - Note (optional)
                <br />
                3. Click &quot;Add Item&quot; to save
              </Typography>

              <Typography variant="h6">Managing Items</Typography>
              <Typography>
                <strong>Edit:</strong> Click the &quot;Edit&quot; button to modify item details
                <br />
                <strong>Delete:</strong> Click &quot;Delete&quot; to remove the entire item entry
                <br />
                (Keep in mind that this will remove ALL entries for that item)
              </Typography>

              <Typography variant="h6">Searching</Typography>
              <Typography>
                Use the search bar at the top of the inventory to filter items by name, room location, or box number.
              </Typography>
              <Typography variant="h6">Other Inquiries</Typography>
              <Typography>
                Let me (Baraa) know if you have any questions, feedback, and/or suggestions.
              </Typography>
            </Stack>
            <Button
              variant="contained"
              onClick={handleHelpClose}
              sx={{ mt: 2 }}
            >
              Got it!
            </Button>
          </Box>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal open={deleteConfirmOpen} onClose={handleDeleteCancel}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: "translate(-50%, -50%)"
            }}
          >
            <Typography variant="h6">Confirm Delete</Typography>
            <Typography>
              Are you sure you want to delete the entire entry for &quot;{itemToDelete?.name}&quot;?
              This action cannot be undone.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={handleDeleteCancel}>
                Cancel
              </Button>
              <Button variant="contained" color="error" onClick={() => deleteEntry(itemToDelete)}>
                Delete
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* History Modal */}
        <Modal open={historyModalOpen} onClose={handleHistoryClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={600}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: "translate(-50%, -50%)",
              maxHeight: "80vh",
              overflowY: "auto"
            }}
          >
            <Typography variant="h5" textAlign="center">
              History for {selectedItemHistory?.name}
            </Typography>
            <Stack spacing={2}>
              {selectedItemHistory?.history.map((entry) => (
                <Box
                  key={entry.id}
                  sx={{
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    p: 2
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    {new Date(entry.timestamp).toLocaleString()} by {entry.by}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {entry.action === "create" ? "Created" :
                     entry.action === "update" ? "Updated" :
                     entry.action === "rename" ? "Renamed" : "Modified"}
                  </Typography>
                  {entry.action === "rename" ? (
                    <Typography>New name: {entry.newName}</Typography>
                  ) : (
                    <Stack spacing={1} mt={1}>
                      <Typography variant="body2">
                        Quantity: {entry.changes.quantity}
                      </Typography>
                      <Typography variant="body2">
                        Room: {entry.changes.roomLocation}
                      </Typography>
                      {entry.changes.boxNumber && (
                        <Typography variant="body2">
                          Box: {entry.changes.boxNumber}
                        </Typography>
                      )}
                      {entry.changes.notes && (
                        <Typography variant="body2">
                          Notes: {entry.changes.notes}
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Box>
              ))}
            </Stack>
            <Button
              variant="contained"
              onClick={handleHistoryClose}
              sx={{ mt: 2 }}
            >
              Close
            </Button>
          </Box>
        </Modal>

        {/* Modal for adding new items */}
        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: "translate(-50%, -50%)"
            }}
          >
            <Typography variant="h6">{isEditing ? "Edit Item" : "Add Item"}</Typography>
            <Stack width="100%" spacing={2}>
              <TextField
                label="Item Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                label="Quantity"
                type="text"
                variant="outlined"
                fullWidth
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <Button
                      size="small"
                      onClick={() => setItemQuantity("MANY")}
                      sx={{ ml: 1 }}
                    >
                      MANY
                    </Button>
                  ),
                }}
              />
              <Autocomplete
                freeSolo
                options={roomLocations}
                value={roomLocation}
                onChange={(event, newValue) => setRoomLocation(newValue || "")}
                onInputChange={(event, newInputValue) => setRoomLocation(newInputValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Room Location"
                    required
                  />
                )}
              />
              <TextField
                label="Box Number (optional)"
                variant="outlined"
                fullWidth
                value={boxNumber}
                onChange={(e) => setBoxNumber(e.target.value)}
              />
              <TextField
                label="Notes (optional)"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!itemName || !roomLocation}
              >
                {isEditing ? "Save Changes" : "Add Item"}
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* Add New Item button */}
        <Button
          variant="contained"
          onClick={() => {
            handleOpen()
          }}
        >
          Add New Item
        </Button>

        {/* Inventory display section */}
        <Box
          border="1px solid #333"
          width="100%"
          maxWidth="800px"
          sx={{
            mx: { xs: 1, sm: 2 }, // Smaller margin on mobile
          }}
        >
          {/* Inventory header */}
          <Box
            bgcolor="#ADD8E6"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap={2}
            p={2}
          >
            <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>Inventory</Typography>
            <TextField
              placeholder="Search items..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                width: '100%',
                maxWidth: '300px',
                bgcolor: 'white'
              }}
            />
            {/* Add sort select */}
            <Box sx={{ alignSelf: 'flex-end', minWidth: 120 }}>
              <TextField
                select
                size="small"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ bgcolor: 'white' }}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="name">Sort by Name</option>
                <option value="room">Sort by Room</option>
                <option value="quantity">Sort by Quantity</option>
                <option value="recent">Sort by Recently Added/Modified</option>
              </TextField>
            </Box>
          </Box>
          {/* Inventory items - apply sorting */}
          <Box
            maxHeight="500px"
            overflow="auto"
            display="flex"
            flexDirection="column"
          >
            {getSortedInventory(inventory)
              .filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.roomLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.boxNumber && item.boxNumber.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .map((item) => (
                <Box
                  key={item.name}
                  display="flex"
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                  p={2}
                  borderBottom="1px solid #333"
                  gap={2}
                >
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {item.name}
                    </Typography>
                    <Stack spacing={1}>
                      <Box 
                        sx={{
                          bgcolor: 'rgba(0, 0, 0, 0.03)',
                          p: 1,
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.primary" component="div">
                          <strong>Room:</strong> {item.roomLocation}
                        </Typography>
                        {item.boxNumber && (
                          <Typography variant="body2" color="text.primary" component="div">
                            <strong>Box:</strong> {item.boxNumber}
                          </Typography>
                        )}
                        {item.notes && (
                          <Typography variant="body2" color="text.primary" component="div">
                            <strong>Notes:</strong> {item.notes}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'stretch', sm: 'center' },
                      gap: 1,
                      minWidth: { sm: '300px' },
                      justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                    }}
                  >
                    <Typography 
                      sx={{ 
                        textAlign: { xs: 'left', sm: 'right' },
                        mb: { xs: 1, sm: 0 }
                      }}
                    >
                      Quantity: {item.quantity} {item.quantity === 1 && "(1 is broken)"}
                    </Typography>
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={1}
                      sx={{ 
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEdit(item)}
                        fullWidth
                        size="small"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteConfirm(item)}
                        fullWidth
                        size="small"
                      >
                        Delete
                      </Button>
                      <Button
                        variant="outlined"
                        color="info"
                        onClick={() => handleHistoryClick(item)}
                        size="small"
                        sx={{
                          minWidth: '40px',
                          width: '40px',
                          padding: 0
                        }}
                      >
                        <GoHistory />
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              ))}
          </Box>
        </Box>
      </SignedIn>
    </Box>
  )
}