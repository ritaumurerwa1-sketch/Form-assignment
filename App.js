import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  Button,
  Pressable,
  ScrollView,
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

const GENDERS = ['Female', 'Male', 'Other'];
const HOBBIES = ['Reading', 'Sports', 'Music', 'Coding'];
const SKILLS = ['React Native', 'JavaScript', 'Design', 'Python'];
const COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];

export default function App() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    // Step 1: Text inputs
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    bio: '',
    // Step 2: Choices
    country: 'Rwanda',
    gender: 'Female',
    hobbies: [],
    skills: [],
    favoriteColor: COLORS[0],
    notifications: false,
    notifyEmail: '',
    // Step 3: Dates & Numbers
    birthDate: new Date(2000, 0, 1),
    meetingTime: new Date(),
    satisfaction: 70,
    quantity: 1,
    rating: 4,
    // Step 4: Files & Consent
    image: null,
    fileName: '',
    terms: false,
  });

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key, item) => {
    const list = form[key];
    if (list.includes(item)) {
      updateForm(key, list.filter((i) => i !== item));
    } else {
      updateForm(key, [...list, item]);
    }
  };

  // Camera capture
  const takePhoto = async () => {
    try {
      const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
      const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!cameraPerm.granted) {
        Alert.alert('Permission Denied', 'Camera permission is needed to take pictures.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // avoids black screen crop bug on Android
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateForm('image', result.assets[0].uri);
        console.log('Photo captured:', result.assets[0].uri);
      }
    } catch (err) {
      console.error('Camera error:', err);
      Alert.alert('Camera Error', err?.message || 'Could not open camera.');
    }
  };

  // Gallery picker
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateForm('image', result.assets[0].uri);
        console.log('Image picked:', result.assets[0].uri);
      }
    } catch (err) {
      console.error('Gallery error:', err);
    }
  };

  // Document picker
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync();
      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateForm('fileName', result.assets[0].name);
        console.log('Document attached:', result.assets[0].name);
      }
    } catch (err) {
      console.error('Document picker error:', err);
    }
  };

  // Form submission & validation
  const handleSubmit = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!form.terms) newErrors.terms = 'You must accept the terms';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.name || newErrors.email || newErrors.password) {
        setStep(1);
      }
      Alert.alert('Incomplete Form', 'Please fix the errors before submitting.');
      return;
    }

    // Output all collected form information to console
    console.log('\n==========================================');
    console.log('       COLLECTED FORM INFORMATION         ');
    console.log('==========================================');
    console.log('Full Name:          ', form.name);
    console.log('Email Address:      ', form.email);
    console.log('Password:           ', form.password);
    console.log('Phone Number:       ', form.phone || '(Not provided)');
    console.log('Age:                ', form.age || '(Not provided)');
    console.log('Bio:                ', form.bio || '(Not provided)');
    console.log('Country:            ', form.country);
    console.log('Gender:             ', form.gender);
    console.log('Hobbies:            ', form.hobbies.join(', ') || 'None');
    console.log('Skills:             ', form.skills.join(', ') || 'None');
    console.log('Favorite Color:     ', form.favoriteColor);
    console.log('Notifications:      ', form.notifications ? `Yes (${form.notifyEmail})` : 'No');
    console.log('Date of Birth:      ', form.birthDate.toDateString());
    console.log('Meeting Time:       ', form.meetingTime.toLocaleTimeString());
    console.log('Satisfaction Level: ', form.satisfaction + '%');
    console.log('Quantity:           ', form.quantity);
    console.log('Rating:             ', form.rating + ' / 5 stars');
    console.log('Profile Photo URI:  ', form.image || 'None');
    console.log('Attached Document:  ', form.fileName || 'None');
    console.log('Terms Accepted:     ', form.terms);
    console.log('\nFull JSON Payload:');
    console.log(JSON.stringify(form, null, 2));
    console.log('==========================================\n');

    Alert.alert('Success', 'Form submitted successfully! Check console for output.');
  };

  const handleReset = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      age: '',
      bio: '',
      country: 'Rwanda',
      gender: 'Female',
      hobbies: [],
      skills: [],
      favoriteColor: COLORS[0],
      notifications: false,
      notifyEmail: '',
      birthDate: new Date(2000, 0, 1),
      meetingTime: new Date(),
      satisfaction: 70,
      quantity: 1,
      rating: 4,
      image: null,
      fileName: '',
      terms: false,
    });
    setErrors({});
    setStep(1);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Registration Form</Text>
        <Text style={styles.stepIndicator}>Step {step} of 4</Text>

        <View style={styles.card}>
          {/* STEP 1: Personal Info (6 inputs) */}
          {step === 1 && (
            <View>
              <View style={styles.field}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  value={form.name}
                  onChangeText={(text) => updateForm('name', text)}
                />
                {errors.name && <Text style={styles.error}>{errors.name}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={(text) => updateForm('email', text)}
                />
                {errors.email && <Text style={styles.error}>{errors.email}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password *</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                    placeholder="Enter password"
                    secureTextEntry={!showPassword}
                    value={form.password}
                    onChangeText={(text) => updateForm('password', text)}
                  />
                  <Button
                    title={showPassword ? 'Hide' : 'Show'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                </View>
                {errors.password && <Text style={styles.error}>{errors.password}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0788 000 000"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(text) => updateForm('phone', text)}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 21"
                  keyboardType="numeric"
                  value={form.age}
                  onChangeText={(text) => updateForm('age', text)}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  placeholder="Tell us a bit about yourself"
                  multiline
                  numberOfLines={3}
                  value={form.bio}
                  onChangeText={(text) => updateForm('bio', text)}
                />
              </View>
            </View>
          )}

          {/* STEP 2: Choices & Preferences (6 inputs) */}
          {step === 2 && (
            <View>
              <View style={styles.field}>
                <Text style={styles.label}>Country</Text>
                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={form.country}
                    onValueChange={(val) => updateForm('country', val)}
                  >
                    <Picker.Item label="Rwanda" value="Rwanda" />
                    <Picker.Item label="Kenya" value="Kenya" />
                    <Picker.Item label="Uganda" value="Uganda" />
                    <Picker.Item label="Tanzania" value="Tanzania" />
                  </Picker>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Gender</Text>
                {GENDERS.map((g) => (
                  <Pressable
                    key={g}
                    style={styles.optionRow}
                    onPress={() => updateForm('gender', g)}
                  >
                    <View style={styles.radioCircle}>
                      {form.gender === g && <View style={styles.radioDot} />}
                    </View>
                    <Text>{g}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Hobbies</Text>
                {HOBBIES.map((h) => {
                  const checked = form.hobbies.includes(h);
                  return (
                    <Pressable
                      key={h}
                      style={styles.optionRow}
                      onPress={() => toggleArrayItem('hobbies', h)}
                    >
                      <View style={styles.checkbox}>
                        {checked && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text>{h}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Skills</Text>
                <View style={styles.wrapRow}>
                  {SKILLS.map((skill) => {
                    const active = form.skills.includes(skill);
                    return (
                      <Pressable
                        key={skill}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => toggleArrayItem('skills', skill)}
                      >
                        <Text style={active ? styles.chipTextActive : styles.chipText}>
                          {skill}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Favorite Color</Text>
                <View style={styles.wrapRow}>
                  {COLORS.map((c) => (
                    <Pressable
                      key={c}
                      style={[
                        styles.colorBox,
                        { backgroundColor: c },
                        form.favoriteColor === c && styles.colorBoxActive,
                      ]}
                      onPress={() => updateForm('favoriteColor', c)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.field}>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Receive Notifications</Text>
                  <Switch
                    value={form.notifications}
                    onValueChange={(val) => updateForm('notifications', val)}
                  />
                </View>
                {form.notifications && (
                  <TextInput
                    style={[styles.input, { marginTop: 8 }]}
                    placeholder="Enter notification email"
                    keyboardType="email-address"
                    value={form.notifyEmail}
                    onChangeText={(text) => updateForm('notifyEmail', text)}
                  />
                )}
              </View>
            </View>
          )}

          {/* STEP 3: Dates & Numbers (5 inputs) */}
          {step === 3 && (
            <View>
              <View style={styles.field}>
                <Text style={styles.label}>Date of Birth</Text>
                <Button
                  title={form.birthDate.toDateString()}
                  onPress={() => setShowDatePicker(true)}
                />
                {showDatePicker && (
                  <DateTimePicker
                    value={form.birthDate}
                    mode="date"
                    onChange={(event, date) => {
                      if (Platform.OS === 'android') setShowDatePicker(false);
                      if (date) updateForm('birthDate', date);
                    }}
                  />
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Meeting Time</Text>
                <Button
                  title={form.meetingTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  onPress={() => setShowTimePicker(true)}
                />
                {showTimePicker && (
                  <DateTimePicker
                    value={form.meetingTime}
                    mode="time"
                    onChange={(event, time) => {
                      if (Platform.OS === 'android') setShowTimePicker(false);
                      if (time) updateForm('meetingTime', time);
                    }}
                  />
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  Satisfaction Level: {form.satisfaction}%
                </Text>
                <Slider
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={form.satisfaction}
                  onValueChange={(val) => updateForm('satisfaction', Math.round(val))}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Quantity</Text>
                <View style={styles.row}>
                  <Button
                    title=" - "
                    onPress={() =>
                      updateForm('quantity', Math.max(1, form.quantity - 1))
                    }
                  />
                  <Text style={styles.quantityText}>{form.quantity}</Text>
                  <Button
                    title=" + "
                    onPress={() => updateForm('quantity', form.quantity + 1)}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Rating: {form.rating} / 5</Text>
                <View style={styles.row}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable key={star} onPress={() => updateForm('rating', star)}>
                      <Text style={styles.star}>
                        {star <= form.rating ? '★' : '☆'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* STEP 4: Files & Consent (3 inputs) */}
          {step === 4 && (
            <View>
              <View style={styles.field}>
                <Text style={styles.label}>Profile Picture</Text>
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Button title="Take Photo" onPress={takePhoto} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <Button title="Choose Photo" onPress={pickImage} />
                  </View>
                </View>

                {form.image && (
                  <View style={styles.imagePreviewBox}>
                    <Image source={{ uri: form.image }} style={styles.previewImage} />
                    <Button
                      title="Remove Photo"
                      color="red"
                      onPress={() => updateForm('image', null)}
                    />
                  </View>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Supporting Document</Text>
                <Button title="Attach Document" onPress={pickDocument} />
                {form.fileName ? (
                  <View style={[styles.rowBetween, { marginTop: 8 }]}>
                    <Text style={{ flex: 1 }}>📎 {form.fileName}</Text>
                    <Button
                      title="Remove"
                      color="red"
                      onPress={() => updateForm('fileName', '')}
                    />
                  </View>
                ) : null}
              </View>

              <View style={styles.field}>
                <Pressable
                  style={styles.optionRow}
                  onPress={() => updateForm('terms', !form.terms)}
                >
                  <View style={styles.checkbox}>
                    {form.terms && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text>I accept the terms and conditions *</Text>
                </Pressable>
                {errors.terms && <Text style={styles.error}>{errors.terms}</Text>}
              </View>

              <View style={{ marginTop: 15 }}>
                <Button title="Submit Form" color="#2ecc71" onPress={handleSubmit} />
              </View>
              <View style={{ marginTop: 10 }}>
                <Button title="Reset" color="#777" onPress={handleReset} />
              </View>
            </View>
          )}
        </View>

        {/* Step Navigation */}
        <View style={styles.rowBetween}>
          {step > 1 ? (
            <Button title="Previous" onPress={() => setStep(step - 1)} />
          ) : (
            <View />
          )}
          {step < 4 ? (
            <Button title="Next" onPress={() => setStep(step + 1)} />
          ) : (
            <View />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#666',
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  multiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4a6cf7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4a6cf7',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#555',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkmark: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a6cf7',
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginTop: 6,
    backgroundColor: '#eee',
  },
  chipActive: {
    backgroundColor: '#4a6cf7',
    borderColor: '#4a6cf7',
  },
  chipText: {
    color: '#333',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#fff',
    fontSize: 13,
  },
  colorBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
    marginTop: 6,
  },
  colorBoxActive: {
    borderWidth: 3,
    borderColor: '#222',
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fafafa',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  star: {
    fontSize: 30,
    color: '#f39c12',
    marginRight: 6,
  },
  imagePreviewBox: {
    alignItems: 'center',
    marginTop: 10,
  },
  previewImage: {
    width: 130,
    height: 130,
    borderRadius: 8,
    marginBottom: 8,
  },
});
