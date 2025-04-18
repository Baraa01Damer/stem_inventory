'use client'
import Image from "next/image";
import { useState, useEffect } from "react"
import { firestore } from "@/firebase"
import { Box, Button, Modal, Stack, TextField, Typography, Autocomplete } from "@mui/material"
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from "firebase/firestore"
import { SignedIn, SignedOut } from "@clerk/nextjs"

export default function Home() {
  // State management for inventory items, modal visibility, and new item name
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [itemToRemove, setItemToRemove] = useState(null)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [language, setLanguage] = useState('en')
  const [itemName, setItemName] = useState("")
  const [itemQuantity, setItemQuantity] = useState("")
  const [roomLocation, setRoomLocation] = useState("")
  const [boxNumber, setBoxNumber] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [originalName, setOriginalName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const roomLocations = [
    "Breakout",
    "Computer Lab (Bot Spot)",
    "Hub",
    "Kitchen",
    "Maker Space",
    "Pixel Place"
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

    await setDoc(docRef, {
      quantity: itemQuantity === "MANY" ? "MANY" : parseInt(itemQuantity),
      roomLocation: roomLocation,
      boxNumber: boxNumber
    })

    // Reset form fields
    setItemName("")
    setItemQuantity("")
    setRoomLocation("")
    setBoxNumber("")

    await updateInventory()
  }

  // Remove an item or decrement quantity
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      if (data.quantity === "MANY" || data.quantity == 1) {
        setItemToRemove(item)
        setRemoveConfirmOpen(true)
      } else {
        await setDoc(docRef, {
          ...data,
          quantity: data.quantity - 1
        })
        await updateInventory()
      }
    }
  }

  const handleRemoveConfirm = async () => {
    const docRef = doc(collection(firestore, "inventory"), itemToRemove)
    await deleteDoc(docRef)
    await updateInventory()
    setRemoveConfirmOpen(false)
    setItemToRemove(null)
  }

  const handleRemoveCancel = () => {
    setRemoveConfirmOpen(false)
    setItemToRemove(null)
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
    setOriginalName("")
  }

  const handleEdit = (item) => {
    setItemName(item.name)
    setItemQuantity(item.quantity)
    setRoomLocation(item.roomLocation)
    setBoxNumber(item.boxNumber || "")
    setOriginalName(item.name)
    setIsEditing(true)
    setOpen(true)
  }

  const handleSave = async () => {
    if (isEditing) {
      // Delete the old document if name changed
      if (originalName !== itemName) {
        const oldDocRef = doc(collection(firestore, "inventory"), originalName)
        await deleteDoc(oldDocRef)
      }
    }

    // Add/Update the item
    const docRef = doc(collection(firestore, "inventory"), itemName)
    await setDoc(docRef, {
      quantity: itemQuantity,
      roomLocation: roomLocation,
      boxNumber: boxNumber
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

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      {/* Logo - shown for both authenticated and unauthenticated users */}
      <Box mb={4} display="flex" justifyContent="center">
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
                3. Click &quot;Add Item&quot; to save
              </Typography>

              <Typography variant="h6">Managing Items</Typography>
              <Typography>
                <strong>Edit:</strong> Click the &quot;Edit&quot; button to modify item details
                <br />
                <strong>Remove:</strong> Click &quot;Remove&quot; to decrease quantity by 1
                <br />
                <strong>Delete All:</strong> Click &quot;Delete All&quot; to remove the entire item entry
                <br />
                (!!!Keep in mind that this will remove ALL entries for that item!!!)
              </Typography>

              <Typography variant="h6">Searching</Typography>
              <Typography>
                Use the search bar at the top of the inventory to filter items by name, room location, or box number.
              </Typography>
              <Typography variant="h6">Other Inquiries</Typography>
              <Typography>
                Let me (Baraa) know if you have any questions, feedback, suggestions. JazakAllah Khair!
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

        {/* Remove Confirmation Modal */}
        <Modal open={removeConfirmOpen} onClose={handleRemoveCancel}>
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
            <Typography variant="h6">Confirm Remove</Typography>
            <Typography>
              Removing this item will delete it from the inventory since its quantity is 1.
              Are you sure you want to proceed?
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={handleRemoveCancel}>
                Cancel
              </Button>
              <Button variant="contained" color="error" onClick={handleRemoveConfirm}>
                Remove
              </Button>
            </Stack>
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
        <Box border="1px solid #333">
          {/* Inventory header */}
          <Box
            width="800px"
            height="100px"
            bgcolor="#ADD8E6"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap={2}
          >
            <Typography variant="h4">Inventory</Typography>
            <TextField
              placeholder="Search items..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: '300px', bgcolor: 'white' }}
            />
          </Box>
          {/* Inventory items */}
          <Box
            width="800px"
            maxHeight="500px"
            overflow="auto"
            display="flex"
            flexDirection="column"
          >
            {inventory
              .filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.roomLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.boxNumber && item.boxNumber.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .map((item) => (
                <Box
                  key={item.name}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={2}
                  borderBottom="1px solid #333"
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Room: {item.roomLocation}
                      {item.boxNumber && ` • Box: ${item.boxNumber}`}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography>Quantity: {item.quantity}</Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          removeItem(item.name)
                        }}
                      >
                        Remove
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteConfirm(item)}
                      >
                        Delete All
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