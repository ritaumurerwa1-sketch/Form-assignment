import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  Button,
  Pressable,
  ScrollView,
  Modal,
  Image,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

/* ------------------------------------------------------------------ */
/* 1. DATA CONSTANTS                                                  */
/* ------------------------------------------------------------------ */

const CITIES = ['Kigali', 'Kampala', 'Nairobi', 'Nyamata', 'Musanze', 'Huye'];
const GENDERS = ['Female', 'Male', 'Other'];
const HOBBIES = ['Reading', 'Music', 'Sports', 'Photography'];
const SKILLS = ['React Native', 'UI/UX Design', 'TypeScript', 'Node.js'];
const COLORS = ['#4a6cf7', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6'];
const TOTAL_STEPS = 4;

const initialForm = {
  // Step 1: Personal Info (Text Inputs - 6 elements)
  name: '',
  email: '',
  password: '',
  phone: '',
  age: '',
  bio: '',

  // Step 2: Choices & Preferences (6 elements)
  country: 'rw',
  gender: 'Female',
  hobbies: [],
  skills: [],
  favoriteColor: COLORS[0],
  notifications: false,
  notifyEmail: '',

  // Step 3: Dates & Numbers (5 elements)
  birthDate: new Date(2000, 0, 1),
  meetingTime: new Date(),
  volume: 75,
  quantity: 1,
  rating: 4,

  // Step 4: Media & Consent (3 elements)
  image: '',
  files: [],
  terms: false,
};

/* ------------------------------------------------------------------ */
/* 2. REUSABLE COMPONENTS                                             */
/* ------------------------------------------------------------------ */

// Field wrapper: Label + input + helper text + error message
function Field({ label, required, helper, error, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.star}> *</Text> : null}
      </Text>
      {children}
      {helper && !error ? <Text style={styles.helper}>{helper}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

// Styled TextInput
function Input({ style, ...props }) {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor="#999"
      {...props}
    />
  );
}

// Checkbox (square) or Radio button (round)
function Choice({ label, selected, onPress, round }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.box, round && styles.round]}>
        {selected && <View style={[styles.mark, round && styles.round]} />}
      </View>
      <Text style={styles.choiceLabel}>{label}</Text>
    </Pressable>
  );
}

// Selectable pill chip
function Chip({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>
        {label}
      </Text>
    </Pressable>
  );
}

// Native Date / Time Picker
function DateField({ label, value, onChange, mode = 'date' }) {
  const [show, setShow] = useState(false);
  const text =
    mode === 'date'
      ? value.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : value.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        });

  return (
    <Field label={label}>
      <Pressable style={styles.dateButton} onPress={() => setShow(true)}>
        <Text style={styles.dateButtonText}>{text}</Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={value}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, picked) => {
            if (Platform.OS === 'android') setShow(false);
            if (picked) onChange(picked);
          }}
        />
      )}
    </Field>
  );
}

// Array toggle helper
const toggleIn = (list, item) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

// Format phone: 0788123456 -> "0788 123 456"
const formatPhone = (text) => {
  const digits = text.replace(/\D/g, '').slice(0, 10);
  return digits.replace(/(\d{0,4})(\d{0,3})(\d{0,3})/, (m, a, b, c) =>
    [a, b, c].filter(Boolean).join(' ')
  );
};

/* ------------------------------------------------------------------ */
/* 3. MAIN FORM COMPONENT                                             */
/* ------------------------------------------------------------------ */

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  /* ---------- Validation ---------- */
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (form.password.length < 6) e.password = 'Must be at least 6 characters';
    if (!form.terms) e.terms = 'You must accept the terms and conditions';
    return e;
  };

  /* ---------- Actions ---------- */
  const handleSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      if (e.name || e.email || e.password) setStep(1);
      Alert.alert('Required Fields', 'Please complete the required fields before submitting.');
      return;
    }
    setConfirmVisible(true);
  };

  const confirmSubmit = () => {
    console.log('Form Submitted successfully:', JSON.stringify(form, null, 2));
    setConfirmVisible(false);
    Alert.alert('Success', 'Form submitted successfully! Check console for payload.');
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setStep(1);
  };

  /* ---------- Camera & Media ---------- */
  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access in device settings to take a photo.'
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        set('image', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Camera Error', error?.message || 'Could not open camera.');
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Gallery Permission Required',
          'Please grant access to your photos to choose a profile image.'
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        set('image', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery picker error:', error);
      Alert.alert('Image Picker Error', error?.message || 'Could not pick image.');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ multiple: true });
      if (result.canceled) return;
      const picked = result.assets.map((f) => ({ name: f.name, uri: f.uri }));
      setForm((prev) => ({ ...prev, files: [...prev.files, ...picked] }));
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Document Picker Error', error?.message || 'Could not attach file.');
    }
  };

  const removeFile = (index) =>
    set(
      'files',
      form.files.filter((_, i) => i !== index)
    );

  /* ================================================================ */
  /* STEP 1: PERSONAL INFORMATION (6 text inputs)                     */
  /* ================================================================ */
  const renderStep1 = () => (
    <>
      <Field label="Full Name" required error={errors.name}>
        <Input
          value={form.name}
          onChangeText={(t) => set('name', t)}
          placeholder="e.g. Jean Dupont"
          autoCapitalize="words"
        />
      </Field>

      <Field label="Email Address" required error={errors.email}>
        <Input
          value={form.email}
          onChangeText={(t) => set('email', t)}
          placeholder="name@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Field>

      <Field
        label="Password"
        required
        helper="Minimum 6 characters"
        error={errors.password}
      >
        <View style={styles.rowBetween}>
          <Input
            style={{ flex: 1, marginRight: 8 }}
            value={form.password}
            onChangeText={(t) => set('password', t)}
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <Pressable
            style={styles.inlineButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.inlineButtonText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        </View>
      </Field>

      <Field label="Phone Number" helper="Formats as 0788 123 456">
        <Input
          value={form.phone}
          onChangeText={(t) => set('phone', formatPhone(t))}
          placeholder="0788 123 456"
          keyboardType="phone-pad"
        />
      </Field>

      <Field label="Age">
        <Input
          value={form.age}
          onChangeText={(t) => set('age', t.replace(/\D/g, ''))}
          placeholder="e.g. 25"
          keyboardType="number-pad"
          maxLength={3}
        />
      </Field>

      <Field label="Bio">
        <Input
          style={styles.multiline}
          value={form.bio}
          onChangeText={(t) => set('bio', t)}
          placeholder="A brief intro about yourself..."
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </Field>
    </>
  );

  /* ================================================================ */
  /* STEP 2: CHOICES & PREFERENCES (6 elements)                       */
  /* ================================================================ */
  const renderStep2 = () => (
    <>
      <Field label="Country">
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.country}
            onValueChange={(v) => set('country', v)}
            style={styles.picker}
          >
            <Picker.Item label="Rwanda" value="rw" />
            <Picker.Item label="Kenya" value="ke" />
            <Picker.Item label="Uganda" value="ug" />
            <Picker.Item label="Tanzania" value="tz" />
            <Picker.Item label="Burundi" value="bi" />
          </Picker>
        </View>
      </Field>

      <Field label="Gender">
        {GENDERS.map((g) => (
          <Choice
            key={g}
            round
            label={g}
            selected={form.gender === g}
            onPress={() => set('gender', g)}
          />
        ))}
      </Field>

      <Field label="Hobbies">
        {HOBBIES.map((h) => (
          <Choice
            key={h}
            label={h}
            selected={form.hobbies.includes(h)}
            onPress={() => set('hobbies', toggleIn(form.hobbies, h))}
          />
        ))}
      </Field>

      <Field label="Skills">
        <View style={styles.rowWrap}>
          {SKILLS.map((s) => (
            <Chip
              key={s}
              label={s}
              selected={form.skills.includes(s)}
              onPress={() => set('skills', toggleIn(form.skills, s))}
            />
          ))}
        </View>
      </Field>

      <Field label="Favorite Color">
        <View style={styles.rowWrap}>
          {COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => set('favoriteColor', c)}
              style={[
                styles.swatch,
                { backgroundColor: c },
                form.favoriteColor === c && styles.swatchOn,
              ]}
            />
          ))}
        </View>
      </Field>

      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Receive Notifications</Text>
          <Text style={styles.helper}>Stay updated with form activity</Text>
        </View>
        <Switch
          value={form.notifications}
          onValueChange={(v) => set('notifications', v)}
          trackColor={{ false: '#d1d8e0', true: '#4a6cf7' }}
          thumbColor="#fff"
        />
      </View>

      {form.notifications && (
        <Field label="Notification Email">
          <Input
            value={form.notifyEmail}
            onChangeText={(t) => set('notifyEmail', t)}
            placeholder="Alternate notification email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Field>
      )}
    </>
  );

  /* ================================================================ */
  /* STEP 3: DATES & METRICS (5 elements)                             */
  /* ================================================================ */
  const renderStep3 = () => (
    <>
      <DateField
        label="Date of Birth"
        value={form.birthDate}
        onChange={(d) => set('birthDate', d)}
      />

      <DateField
        label="Preferred Meeting Time"
        mode="time"
        value={form.meetingTime}
        onChange={(d) => set('meetingTime', d)}
      />

      <Field label={`Satisfaction Level: ${form.volume}%`}>
        <Slider
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={form.volume}
          minimumTrackTintColor="#4a6cf7"
          maximumTrackTintColor="#dcdde1"
          thumbTintColor="#4a6cf7"
          onValueChange={(v) => set('volume', Math.round(v))}
        />
      </Field>

      <Field label="Quantity">
        <View style={styles.stepperRow}>
          <Pressable
            style={styles.stepperBtn}
            onPress={() => set('quantity', Math.max(1, form.quantity - 1))}
          >
            <Text style={styles.stepperBtnText}>−</Text>
          </Pressable>
          <Text style={styles.quantity}>{form.quantity}</Text>
          <Pressable
            style={styles.stepperBtn}
            onPress={() => set('quantity', form.quantity + 1)}
          >
            <Text style={styles.stepperBtnText}>+</Text>
          </Pressable>
        </View>
      </Field>

      <Field label="Rating">
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => set('rating', n)}>
              <Text style={styles.starIcon}>
                {n <= form.rating ? '★' : '☆'}
              </Text>
            </Pressable>
          ))}
          <Text style={styles.ratingText}>{form.rating} / 5</Text>
        </View>
      </Field>
    </>
  );

  /* ================================================================ */
  /* STEP 4: MEDIA & SUBMISSION (3 elements, verification removed)    */
  /* ================================================================ */
  const renderStep4 = () => (
    <>
      <Field label="Profile Picture">
        <View style={styles.mediaButtonRow}>
          <Pressable style={styles.mediaBtnPrimary} onPress={takePhoto}>
            <Text style={styles.mediaBtnTextPrimary}>📷 Take Photo</Text>
          </Pressable>
          <View style={{ width: 10 }} />
          <Pressable style={styles.mediaBtnSecondary} onPress={pickImage}>
            <Text style={styles.mediaBtnTextSecondary}>🖼 Choose Photo</Text>
          </Pressable>
        </View>

        {form.image ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: form.image }} style={styles.preview} />
            <Pressable
              style={styles.removeImageBtn}
              onPress={() => set('image', '')}
            >
              <Text style={styles.removeImageText}>Remove Photo</Text>
            </Pressable>
          </View>
        ) : null}
      </Field>

      <Field label="Documents">
        <Pressable style={styles.attachBtn} onPress={pickDocument}>
          <Text style={styles.attachBtnText}>📎 Attach Documents</Text>
        </Pressable>
        {form.files.map((file, index) => (
          <View key={index} style={styles.fileItem}>
            <Text style={styles.fileName} numberOfLines={1}>
              📄 {file.name}
            </Text>
            <Pressable onPress={() => removeFile(index)}>
              <Text style={styles.removeFileText}>✕</Text>
            </Pressable>
          </View>
        ))}
      </Field>

      <Field label="Consent" error={errors.terms}>
        <Choice
          label="I accept the terms and conditions *"
          selected={form.terms}
          onPress={() => set('terms', !form.terms)}
        />
      </Field>

      <View style={styles.spaceTop}>
        <Pressable style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Submit Form</Text>
        </Pressable>
      </View>
      <View style={{ marginTop: 10 }}>
        <Pressable style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>Reset Form</Text>
        </Pressable>
      </View>
    </>
  );

  /* ================================================================ */
  /* SCREEN RENDER                                                    */
  /* ================================================================ */
  const stepTitles = [
    'Personal Info',
    'Preferences',
    'Dates & Metrics',
    'Media & Finish',
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Registration Form</Text>

        {/* Step indicator */}
        <Text style={styles.stepText}>
          Step {step} of {TOTAL_STEPS}: {stepTitles[step - 1]}
        </Text>
        <View style={styles.dots}>
          {[1, 2, 3, 4].map((n) => (
            <View key={n} style={[styles.dot, n <= step && styles.dotOn]} />
          ))}
        </View>

        {/* Step Card Content */}
        <View style={styles.card}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </View>

        {/* Previous / Next buttons */}
        <View style={styles.rowBetween}>
          {step > 1 ? (
            <Pressable
              style={styles.navButton}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.navButtonText}>← Previous</Text>
            </Pressable>
          ) : (
            <View />
          )}

          {step < TOTAL_STEPS ? (
            <Pressable
              style={[styles.navButton, styles.navButtonNext]}
              onPress={() => setStep(step + 1)}
            >
              <Text style={[styles.navButtonText, styles.navButtonNextText]}>
                Next →
              </Text>
            </Pressable>
          ) : (
            <View />
          )}
        </View>
      </ScrollView>

      {/* Confirmation modal */}
      <Modal
        transparent
        animationType="fade"
        visible={confirmVisible}
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Submit the Form?</Text>
            <Text style={styles.dialogMessage}>
              Are you sure you want to submit your details? You can review your
              entries or confirm to proceed.
            </Text>
            <View style={styles.dialogActions}>
              <Pressable
                style={styles.dialogCancelBtn}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.dialogConfirmBtn}
                onPress={confirmSubmit}
              >
                <Text style={styles.dialogConfirmText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* 4. STYLES                                                          */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f6fa' },
  container: { padding: 20, paddingTop: 56, paddingBottom: 60 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1f36', marginBottom: 4 },
  stepText: { color: '#636e72', fontSize: 14, marginBottom: 8, fontWeight: '500' },
  dots: { flexDirection: 'row', marginBottom: 20 },
  dot: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#dfe6e9',
    marginRight: 6,
  },
  dotOn: { backgroundColor: '#4a6cf7' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  field: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', color: '#2d3436', marginBottom: 6 },
  star: { color: '#e74c3c' },
  helper: { color: '#8395a7', fontSize: 12, marginTop: 4 },
  error: { color: '#e74c3c', fontSize: 12, marginTop: 4, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fcfcfc',
    color: '#2f3640',
  },
  multiline: { height: 80 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  choiceLabel: { fontSize: 14, color: '#2f3640' },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  box: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#718093',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  round: { borderRadius: 10 },
  mark: { width: 10, height: 10, backgroundColor: '#4a6cf7', borderRadius: 2 },
  chip: {
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    marginTop: 8,
    backgroundColor: '#f8f9fa',
  },
  chipOn: { backgroundColor: '#4a6cf7', borderColor: '#4a6cf7' },
  chipText: { color: '#4a4a4a', fontSize: 13 },
  chipTextOn: { color: '#ffffff', fontWeight: '600' },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderRadius: 8,
    backgroundColor: '#fcfcfc',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  swatch: { width: 34, height: 34, borderRadius: 17, marginRight: 10, marginTop: 4 },
  swatchOn: { borderWidth: 3, borderColor: '#1e272e' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 4,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#f8f9fa',
  },
  dateButtonText: { fontSize: 15, color: '#2f3640', fontWeight: '500' },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#4a6cf7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  quantity: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, color: '#2d3436' },
  starRow: { flexDirection: 'row', alignItems: 'center' },
  starIcon: { fontSize: 32, color: '#f1c40f', marginRight: 4 },
  ratingText: { marginLeft: 10, fontSize: 14, fontWeight: '600', color: '#636e72' },
  mediaButtonRow: { flexDirection: 'row', marginBottom: 10 },
  mediaBtnPrimary: {
    flex: 1,
    backgroundColor: '#4a6cf7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mediaBtnTextPrimary: { color: '#fff', fontWeight: '600', fontSize: 14 },
  mediaBtnSecondary: {
    flex: 1,
    backgroundColor: '#eef1ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a6cf7',
  },
  mediaBtnTextSecondary: { color: '#4a6cf7', fontWeight: '600', fontSize: 14 },
  previewContainer: {
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
  },
  preview: { width: 140, height: 140, borderRadius: 10 },
  removeImageBtn: { marginTop: 8 },
  removeImageText: { color: '#e74c3c', fontSize: 13, fontWeight: '600' },
  attachBtn: {
    backgroundColor: '#f1f2f6',
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  attachBtnText: { color: '#2f3640', fontWeight: '500' },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
  },
  fileName: { flex: 1, fontSize: 13, color: '#2f3640', marginRight: 8 },
  removeFileText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 16 },
  inlineButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#eef1ff',
    borderRadius: 8,
  },
  inlineButtonText: { color: '#4a6cf7', fontWeight: '600', fontSize: 13 },
  spaceTop: { marginTop: 14 },
  submitBtn: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resetBtn: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f1f2f6',
  },
  resetBtnText: { color: '#636e72', fontSize: 14, fontWeight: '600' },
  navButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#eef1ff',
  },
  navButtonText: { color: '#4a6cf7', fontWeight: '600', fontSize: 14 },
  navButtonNext: { backgroundColor: '#4a6cf7' },
  navButtonNextText: { color: '#ffffff' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 22,
    width: '100%',
    maxWidth: 340,
  },
  dialogTitle: { fontSize: 18, fontWeight: '700', color: '#1a1f36', marginBottom: 10 },
  dialogMessage: { fontSize: 14, color: '#636e72', marginBottom: 20, lineHeight: 20 },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  dialogCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  dialogCancelText: { color: '#636e72', fontWeight: '600' },
  dialogConfirmBtn: {
    backgroundColor: '#4a6cf7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  dialogConfirmText: { color: '#fff', fontWeight: '600' },
});
