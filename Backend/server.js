
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Transaction Schema
const transactionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0.01
    },
    type: {
        type: String,
        enum: ["income", "expense"],
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

// Home Route
app.get("/", (req, res) => {
    res.send("Welcome to SpendWise AI Backend!");
});

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        message: "SpendWise AI Backend is working successfully!"
    });
});

// GET - Fetch all transactions
app.get("/api/transactions", async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });

        console.log("MongoDB transactions:", transactions);

        res.json(transactions);
    } catch (error) {
        console.error("GET transactions error:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// POST - Add a transaction
app.post("/api/transactions", async (req, res) => {
    try {
        const { title, amount, type, category } = req.body || {};

        if (
            typeof title !== "string" ||
            !title.trim() ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0 ||
            !["income", "expense"].includes(type) ||
            typeof category !== "string" ||
            !category.trim()
        ) {
            return res.status(400).json({
                message: "Please provide valid transaction details."
            });
        }

        const transaction = await Transaction.create({
            title: title.trim(),
            amount: Number(amount),
            type,
            category: category.trim()
        });

        res.status(201).json({
            message: "Transaction added successfully!",
            transaction
        });
    } catch (error) {
        console.error("POST transaction error:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// PUT - Update a transaction
app.put("/api/transactions/:id", async (req, res) => {
    try {
        const { title, amount, type, category } = req.body || {};

        if (
            typeof title !== "string" ||
            !title.trim() ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0 ||
            !["income", "expense"].includes(type) ||
            typeof category !== "string" ||
            !category.trim()
        ) {
            return res.status(400).json({
                message: "Please provide valid transaction details."
            });
        }

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid transaction ID."
            });
        }

        const transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            {
                title: title.trim(),
                amount: Number(amount),
                type,
                category: category.trim()
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found."
            });
        }

        res.json({
            message: "Transaction updated successfully!",
            transaction
        });
    } catch (error) {
        console.error("PUT transaction error:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// DELETE - Delete a transaction
app.delete("/api/transactions/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid transaction ID."
            });
        }

        const transaction = await Transaction.findByIdAndDelete(
            req.params.id
        );

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found."
            });
        }

        res.json({
            message: "Transaction deleted successfully!"
        });
    } catch (error) {
        console.error("DELETE transaction error:", error.message);
        res.status(500).json({ message: error.message });
    }
});

// Connect MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
        console.log("Connected database:", mongoose.connection.name);

        app.listen(PORT, () => {
            console.log(
                `SpendWise AI server running at http://localhost:${PORT}`
            );
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });
