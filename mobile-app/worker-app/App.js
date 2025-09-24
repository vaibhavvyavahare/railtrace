import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import axios from 'axios';
// Import test barcode component
import TestBarcode from './TestBarcode';

// API URL Configuration
// This function helps determine the correct API URL based on your environment
const getApiUrl = () => {
  // For Android Emulator: Use 10.0.2.2 (special IP that connects to host machine's localhost)
  // For iOS Simulator: Use localhost
  // For physical devices: Use your computer's actual IP address on the network
  
  // IMPORTANT: Replace this IP with your computer's actual IP address on your network
  // You can find your IP by running 'ipconfig' in Command Prompt (Windows) or 'ifconfig' in Terminal (Mac/Linux)
  
  // The port where your backend server is running
  const API_PORT = '3001';
  
  // IMPORTANT: Make sure this IP matches your computer's IP address where the backend server is running
  // The Expo server is running on 192.168.1.14 according to the logs
  // But the backend server might be running on a different IP
  return `http://192.168.1.14:${API_PORT}/api`;
  //  return `http://10.255.231.37:${API_PORT}/api`;
//  return `http://192.168.43.55:${API_PORT}/api`;
  // return 192.168.43.55
};
const API_URL = getApiUrl();
const Stack = createStackNavigator();

// Login Screen Component
const LoginScreen = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!userId || !password) {
      setError('Please enter both user ID and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log(`Attempting to connect to: ${API_URL}/auth/login`);
      const response = await axios.post(`${API_URL}/auth/login`, { user_id: userId, password });
      console.log('Login response received:', response.status);
      const userData = response.data;
      
      // Navigate to appropriate screen based on user type
      if (userData.user_type === 'officer') {
        navigation.replace('OfficerHome', { user: userData });
      } else if (userData.user_type === 'worker') {
        navigation.replace('WorkerHome', { user: userData });
      } else {
        setError('This app is only for officers and workers');
      }
    } catch (err) {
      console.error('Login error:', err.message);
      
      // Provide more specific error messages based on the error type
      if (err.message.includes('Network Error')) {
        setError('Network error: Cannot connect to server. Please check your network connection and make sure the server IP address is correct.');
      } else if (err.response) {
        // The server responded with a status code outside the 2xx range
        const errorMsg = err.response.data?.message || `Server error (${err.response.status}): ${err.response.statusText}`;
        setError(errorMsg);
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check if the server is running and the IP address is correct.');
      } else {
        // Something else happened while setting up the request
        setError(`Login error: ${err.message}`);
      }
    }

    setLoading(false);
  };

  // Function to test server connection
  const testConnection = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Try to connect to the test endpoint
      const response = await axios.get(`${API_URL}/test`);
      if (response.status === 200) {
        setError(`Connection successful! Server responded: ${response.data.message}`);
      } else {
        setError(`Server responded with status: ${response.status}`);
      }
    } catch (err) {
      console.error('Connection test error:', err.message);
      if (err.message.includes('Network Error')) {
        setError(`Network error: Cannot connect to ${API_URL}. Please check your network and server IP.`);
      } else if (err.response) {
        setError(`Server error (${err.response.status}): ${err.response.statusText}`);
      } else if (err.request) {
        setError(`No response from server at ${API_URL}. Check if server is running.`);
      } else {
        setError(`Connection error: ${err.message}`);
      }
    }
    
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginContainer}>
        <Text style={styles.title}>RailTrace Mobile</Text>
        <Text style={styles.subtitle}>Login to continue</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TextInput
          style={styles.input}
          placeholder="User ID (O-xxx or W-xxx)"
          value={userId}
          onChangeText={setUserId}
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.loginButton, { marginTop: 10, backgroundColor: '#4a90e2' }]} 
          onPress={testConnection}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>Test Server Connection</Text>
        </TouchableOpacity>
        
        <Text style={styles.infoText}>
          Server URL: {API_URL}
        </Text>
      </View>
      <StatusBar style="auto" />
    </View>
  );
};

// Officer Home Screen
const OfficerHomeScreen = ({ route, navigation }) => {
  const { user } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Officer Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome, {user.officer_name}</Text>
        <Text style={styles.headerInfo}>{user.department} | {user.role}</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('QRScanner', { user, userType: 'officer' })}
        >
          <Text style={styles.menuItemText}>Scan QR Code</Text>
          <Text style={styles.menuItemDescription}>View vendor and maintenance details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>View Reports</Text>
          <Text style={styles.menuItemDescription}>Access installation and maintenance reports</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Worker Home Screen
const WorkerHomeScreen = ({ route, navigation }) => {
  const { user } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Worker Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome, {user.worker_name}</Text>
        <Text style={styles.headerInfo}>Specialization: {user.specialization}</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('QRScanner', { user, userType: 'worker' })}
        >
          <Text style={styles.menuItemText}>Scan QR Code</Text>
          <Text style={styles.menuItemDescription}>Record installation or maintenance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>My Assignments</Text>
          <Text style={styles.menuItemDescription}>View your current work assignments</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// QR Scanner Screen with Camera and Test Data Fallback
const QRScannerScreen = ({ route, navigation }) => {
  const { user, userType } = route.params;

  const handleCodeScanned = (scannedData) => {
    if (scannedData) {
      navigation.navigate('ScanResult', { qrDataString: scannedData, user, userType });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TestBarcode onScan={handleCodeScanned} />
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

// Scan Result Screen
const ScanResultScreen = ({ route, navigation }) => {
  const { qrDataString, user, userType } = route.params;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      if (!qrDataString) {
        setError('No QR data provided.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        console.log(`Scanning QR data: ${qrDataString}`);
        const response = await axios.post(`${API_URL}/scan-qr`, { qr_data: qrDataString });
        setDetails(response.data);
      } catch (err) {
        console.error('Scan Error:', err);
        if (err.response) {
          setError(`Error: ${err.response.data.message || 'Failed to fetch details.'}`);
        } else if (err.request) {
          setError('Network Error: Could not connect to the server.');
        } else {
          setError(`An unexpected error occurred: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [qrDataString]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading component details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Scan Again" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  if (!details) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>No details found for this QR code.</Text>
        <Button title="Scan Again" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  // Helper to render a detail item
  const renderDetail = (label, value) => (
    <Text style={styles.detailItem}>
      <Text style={{ fontWeight: 'bold' }}>{label}:</Text> {value || 'N/A'}
    </Text>
  );

  return (
    <ScrollView style={styles.resultContainer}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle}>Scan Result</Text>
        <Text style={styles.resultSubtitle}>
          {details.type === 'item' ? `Fitting ID: ${details.fitting_id}` : `Batch ID: ${details.batch_id}`}
        </Text>
      </View>

      {/* General Information */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Component Information</Text>
        {renderDetail('Component Type', details.component_type)}
        {renderDetail('Order ID', details.order_id)}
        {renderDetail('Order Status', details.order_status)}
        {details.type === 'item' && renderDetail('Item Status', details.status)}
      </View>
      
      {/* Vendor Information */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Vendor Information</Text>
        {renderDetail('Vendor Name', details.vendor_name)}
        {renderDetail('Vendor ID', details.vendor_id)}
      </View>

      {/* Installation Details (for items) */}
      {details.type === 'item' && details.installation && (
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Installation Record</Text>
          {renderDetail('Installed At', new Date(details.installation.installed_at).toLocaleString())}
          {renderDetail('Worker ID', details.installation.worker_id)}
          {renderDetail('Location', `Lat: ${details.installation.location_lat}, Long: ${details.installation.location_long}`)}
          {renderDetail('Notes', details.installation.notes)}
        </View>
      )}

      {/* Maintenance History (for items) */}
      {details.type === 'item' && (
         <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Maintenance History</Text>
            {details.maintenance && details.maintenance.length > 0 ? (
              details.maintenance.map((record, index) => (
                <View key={index} style={styles.maintenanceRecord}>
                  {renderDetail('Date', new Date(record.reported_at).toLocaleString())}
                  {renderDetail('Officer ID', record.officer_id)}
                  {renderDetail('Issue', record.issue_description)}
                  {renderDetail('Status', record.status)}
                </View>
              ))
            ) : (
              <Text>No maintenance records found.</Text>
            )}
        </View>
      )}
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {userType === 'worker' && details.type === 'item' && (
          <>
            {!details.installation ? (
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Installation', { fitting_id: details.fitting_id, worker_id: user.worker_id })}>
                <Text style={styles.actionButtonText}>Record Installation</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Maintenance', { fitting_id: details.fitting_id, worker_id: user.worker_id })}>
                <Text style={styles.actionButtonText}>Record Maintenance</Text>
              </TouchableOpacity>
            )}
          </>
        )}
         {userType === 'officer' && details.type === 'item' && (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Create Maintenance Record</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Scan Another</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Installation Screen Component
const InstallationScreen = ({ route, navigation }) => {
  const { fitting_id, worker_id } = route.params;
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // You might want to get the device's current location here
    // For simplicity, we'll use mock data or manual input
  }, []);

  const handleRecordInstallation = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/worker/installation`, {
        fitting_id,
        worker_id,
        location_lat: location ? location.latitude : null,
        location_long: location ? location.longitude : null,
        notes,
      });
      Alert.alert('Success', 'Installation recorded successfully.');
      navigation.goBack();
    } catch (err) {
      setError('Failed to record installation.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record Installation</Text>
      <Text>Fitting ID: {fitting_id}</Text>
      <TextInput
        style={styles.input}
        placeholder="Installation Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      {/* Add location input fields if needed */}
      <Button title={loading ? 'Submitting...' : 'Submit Installation'} onPress={handleRecordInstallation} disabled={loading} />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

// Maintenance Screen Component
const MaintenanceScreen = ({ route, navigation }) => {
  const { fitting_id, worker_id } = route.params;
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRecordMaintenance = async () => {
    if (!issue) {
      setError('Please describe the issue.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/worker/maintenance`, {
        fitting_id,
        worker_id,
        issue_description: issue,
      });
      Alert.alert('Success', 'Maintenance issue recorded successfully.');
      navigation.goBack();
    } catch (err) {
      setError('Failed to record maintenance issue.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record Maintenance Issue</Text>
      <Text>Fitting ID: {fitting_id}</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe the issue..."
        value={issue}
        onChangeText={setIssue}
        multiline
      />
      <Button title={loading ? 'Submitting...' : 'Submit Issue'} onPress={handleRecordMaintenance} disabled={loading} />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};


// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OfficerHome" component={OfficerHomeScreen} />
        <Stack.Screen name="WorkerHome" component={WorkerHomeScreen} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
        <Stack.Screen name="ScanResult" component={ScanResultScreen} />
        <Stack.Screen name="Installation" component={InstallationScreen} />
        <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mockScannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 60, // Space for back button
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 60, // Space for back button
  },
  cameraContainer: {
    width: '100%',
    height: 300,
    overflow: 'hidden',
    borderRadius: 10,
    marginBottom: 20,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  mockCameraBox: {
    width: '100%',
    height: 300,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  mockCameraText: {
    color: '#fff',
    fontSize: 16,
  },
  infoText: {
    marginTop: 20,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#7f8c8d',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoText: {
    marginTop: 20,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#95a5a6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#fff',
    marginTop: 5,
  },
  headerInfo: {
    fontSize: 14,
    color: '#ecf0f1',
    marginTop: 5,
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanOverlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scanText: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  rescanButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  resultHeader: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 50,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#ecf0f1',
    marginTop: 5,
  },
  detailsSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  detailItem: {
    fontSize: 14,
    marginBottom: 5,
    color: '#34495e',
  },
  maintenanceRecord: {
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
    paddingLeft: 10,
    marginBottom: 15,
  },
  actionButtons: {
    margin: 15,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#ecf0f1',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  secondaryButtonText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});