'use client'
import Image from "next/image";
import { useState, useEffect } from "react"
import { firestore } from "@/firebase"
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material"
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from "firebase/firestore"
import { SignedIn, SignedOut } from "@clerk/nextjs"

export default function Home() {
  // State management for inventory items, modal visibility, and new item name
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState("")
  const [itemQuantity, setItemQuantity] = useState(1)
  const [roomLocation, setRoomLocation] = useState("")
  const [boxNumber, setBoxNumber] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [originalName, setOriginalName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

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
      quantity: itemQuantity,
      roomLocation: roomLocation,
      boxNumber: boxNumber
    })

    // Reset form fields
    setItemName("")
    setItemQuantity(1)
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
      if (data.quantity == 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { 
          ...data,
          quantity: data.quantity - 1 
        })
      }
    }

    await updateInventory()
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
    setItemQuantity(1)
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
                type="number"
                variant="outlined"
                fullWidth
                value={itemQuantity}
                onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                InputProps={{ inputProps: { min: 1 } }}
              />
              <TextField
                label="Room Location"
                variant="outlined"
                fullWidth
                value={roomLocation}
                onChange={(e) => setRoomLocation(e.target.value)}
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