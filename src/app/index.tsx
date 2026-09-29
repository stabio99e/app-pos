import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, ImageBackground, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Navigate to POS Dashboard
    router.replace('/pos');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.layout}>
          
          {/* LEFT SIDE: Image Cover (Hidden on Mobile) */}
          {!isMobile && (
            <View style={styles.imageSection}>
              <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80' }} 
                style={styles.coverImage}
                resizeMode="cover"
              >
                <View style={styles.overlay}>
                   <View style={styles.brandContainer}>
                     <View style={styles.logoBox}>
                       <Text style={styles.logoIcon}>☕</Text>
                     </View>
                     <Text style={styles.brandName}>Ewe Coffee POS</Text>
                   </View>
                   <View style={styles.heroTextContainer}>
                     <Text style={styles.heroTitle}>Manage your cafe effortlessly.</Text>
                     <Text style={styles.heroSubtitle}>Streamline orders, manage tables, and track your daily sales in one powerful platform.</Text>
                   </View>
                </View>
              </ImageBackground>
            </View>
          )}

          {/* RIGHT SIDE: Login Form */}
          <View style={[styles.formSection, isMobile && styles.formSectionMobile]}>
            <View style={styles.formContainer}>
              {/* Show brand on mobile since image is hidden */}
              {isMobile && (
                <View style={styles.mobileBrandContainer}>
                  <Text style={styles.brandNameMobile}>ewe <Text style={{fontWeight: '400'}}>Ewe Coffee</Text></Text>
                </View>
              )}

              <View style={styles.header}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to access your POS system</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </TouchableOpacity>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text style={styles.registerLink}>Register now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  keyboardView: { flex: 1 },
  layout: { flex: 1, flexDirection: 'row' },
  
  // Left Side Image
  imageSection: { flex: 1.2, backgroundColor: '#111827' },
  coverImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(17, 24, 39, 0.7)', padding: 40, justifyContent: 'space-between' },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox: { backgroundColor: '#eab308', width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoIcon: { fontSize: 20 },
  brandName: { color: '#ffffff', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  heroTextContainer: { marginBottom: 60, maxWidth: 500 },
  heroTitle: { color: '#ffffff', fontSize: 48, fontWeight: '800', lineHeight: 56, marginBottom: 16 },
  heroSubtitle: { color: '#d1d5db', fontSize: 18, lineHeight: 28, fontWeight: '400' },
  
  // Right Side Form
  formSection: { flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center', padding: 24 },
  formSectionMobile: { backgroundColor: '#ffffff', padding: 24 },
  formContainer: { width: '100%', maxWidth: 400, backgroundColor: '#ffffff', padding: 32, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  mobileBrandContainer: { marginBottom: 32, alignItems: 'center' },
  brandNameMobile: { fontSize: 24, fontWeight: '800', color: '#111827' },
  
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6b7280' },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 16, fontSize: 15, color: '#111827' },
  
  forgotPassword: { alignSelf: 'flex-end', marginTop: 12 },
  forgotPasswordText: { fontSize: 13, fontWeight: '600', color: '#eab308' },
  
  loginButton: { flexDirection: 'row', backgroundColor: '#eab308', borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, shadowColor: '#eab308', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  loginButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { color: '#6b7280', fontSize: 14 },
  registerLink: { color: '#eab308', fontSize: 14, fontWeight: '700' }
});
