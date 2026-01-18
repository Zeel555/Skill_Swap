#!/usr/bin/env node

/**
 * Simple script to find your local network IP address
 * Run with: node scripts/get-ip.js
 */

const os = require("os");

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const ips = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push({
          interface: name,
          address: iface.address,
        });
      }
    }
  }

  return ips;
}

console.log("\n🌐 Your Network IP Addresses:\n");
const ips = getLocalIP();

if (ips.length === 0) {
  console.log("❌ No network IP found. Make sure you're connected to a network.");
} else {
  ips.forEach((ip, index) => {
    console.log(`${index + 1}. ${ip.interface}: ${ip.address}`);
  });
  
  const primaryIP = ips[0].address;
  console.log(`\n✅ Primary IP: ${primaryIP}`);
  console.log(`\n📝 Use this in your frontend .env file:`);
  console.log(`   VITE_API_URL=http://${primaryIP}:5000/api\n`);
  console.log(`📝 Or access frontend at:`);
  console.log(`   http://${primaryIP}:5173\n`);
}

