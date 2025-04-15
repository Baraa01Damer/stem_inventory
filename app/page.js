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

  // Add a new item or change quantity if item exists
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }

    await updateInventory()
  }

  // Remove an item or decrement quantity
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity == 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
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
  const handleClose = () => setOpen(false)

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
            <Typography variant="h6">Add Item</Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value)
                }}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName)
                  setItemName("")
                  handleClose()
                }}
              >
                Add
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
            justifyContent="center"
            alignItems="center"
          >
            <Typography variant="h4">Inventory</Typography>
          </Box>
          {/* Inventory items */}
          <Box
            width="800px"
            maxHeight="500px"
            overflow="auto"
            display="flex"
            flexDirection="column"
          >
            {inventory.map((item) => (
              <Box
                key={item.name}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                borderBottom="1px solid #333"
              >
                <Typography>{item.name}</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography>Quantity: {item.quantity}</Typography>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      removeItem(item.name)
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </SignedIn>
    </Box>
  )
}