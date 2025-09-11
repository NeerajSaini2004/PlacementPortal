#!/bin/bash

echo "========================================"
echo "MBM University Placement Portal Setup"
echo "========================================"

echo ""
echo "Installing Backend Dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install backend dependencies"
    exit 1
fi

echo ""
echo "Installing Frontend Dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install frontend dependencies"
    exit 1
fi

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "To run the application:"
echo "1. Start MongoDB service"
echo "2. Backend: cd backend && npm run dev"
echo "3. Frontend: cd client && npm run dev"
echo "4. Seed data: cd backend && npm run seed"
echo ""
echo "Default Admin Login:"
echo "Email: tpo@mbm.ac.in"
echo "Password: admin123"
echo ""