"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/apiClient';
import { API_BASE_URL, AUDIO_URL_PATH } from '@/types/contstants';
import Image from 'next/image';

// Google Places Autocomplete types
declare global {
  interface Window {
    google: any;
    initGooglePlaces: () => void;
  }
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [signupStep, setSignupStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    farmName: '',
    mainCrop: '',
    farmSizeHectares: '',
    latitude: '',
    longitude: '',
    locationName: '',
    organicOnly: true,
    voiceModeEnabled: true,
    role: 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autocompleteRef = useRef<HTMLInputElement | null>(null);
  const placesAutocompleteRef = useRef<any>(null);
  const router = useRouter();
  const { login } = useAuth();

  // Signup steps configuration with descriptions
  const signupSteps = useMemo(() => [
    { 
      id: 'email', 
      label: 'Email', 
      description: 'Please enter your email address. This will be used to log in to your account.',
      required: true 
    },
    { 
      id: 'password', 
      label: 'Password', 
      description: 'Create a secure password with at least 6 characters. Make sure to use a combination of letters and numbers.',
      required: true 
    },
    { 
      id: 'firstName', 
      label: 'First Name', 
      description: 'What is your first name? This helps us personalize your experience.',
      required: true 
    },
    { 
      id: 'farmName', 
      label: 'Farm Name', 
      description: 'What is the name of your farm? This is optional but helps us provide better recommendations.',
      required: false 
    },
    { 
      id: 'mainCrop', 
      label: 'Main Crop', 
      description: 'What is your main crop? This helps us tailor advice and recommendations to your farming needs.',
      required: false 
    },
    { 
      id: 'farmSizeHectares', 
      label: 'Farm Size', 
      description: 'How large is your farm in hectares? This information helps us provide accurate recommendations.',
      required: false 
    },
    { 
      id: 'locationName', 
      label: 'Location', 
      description: 'Where is your farm located? Start typing your location and select from the suggestions. We\'ll automatically get the coordinates for accurate weather information.',
      required: false 
    },
  ], []);

  const totalSteps = signupSteps.length;

  // Load Google Places API
  useEffect(() => {
    if (isLogin) return;

    const loadGooglePlaces = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setGoogleLoaded(true);
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        setGoogleLoaded(true); 
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.');
        setError('Failed to load Google Maps. Please configure your API key in .env.local');
      };
      document.head.appendChild(script);
    };

    loadGooglePlaces();
  }, [isLogin]);

  // Initialize Places Autocomplete when location step is active
  useEffect(() => {
    if (!isLogin && signupStep === 6 && googleLoaded && autocompleteRef.current && window.google?.maps?.places) {
      // Cleanup existing autocomplete
      if (placesAutocompleteRef.current && window.google.maps.event) {
        window.google.maps.event.clearInstanceListeners(placesAutocompleteRef.current);
      }

      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteRef.current,
        { types: ['geocode', 'establishment'] }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const location = place.geometry.location;
          setFormData(prev => ({
            ...prev,
            locationName: place.formatted_address || place.name || '',
            latitude: location.lat().toString(),
            longitude: location.lng().toString(),
          }));
        }
      });

      placesAutocompleteRef.current = autocomplete;
    }

    return () => {
      if (placesAutocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(placesAutocompleteRef.current);
      }
    };
  }, [signupStep, googleLoaded, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      // Convert form data to match backend expectations
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: '',
          farmName: formData.farmName || null,
          mainCrop: formData.mainCrop || null,
          farmSizeHectares: formData.farmSizeHectares ? parseFloat(formData.farmSizeHectares) : null,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            locationName: formData.locationName || null,
            organicOnly: true,
            voiceModeEnabled: formData.voiceModeEnabled,
            role: 'admin',
        };
      const data = await apiClient.post<{ access_token: string, user: any }>(endpoint, payload);

      if (data) {
        console.log('Login successful, data:', data);
        login(data.access_token, data.user);

        console.log('Redirecting to dashboard...');
        router.push('/');
      } else {
        console.log('Login failed:', data);
        setError((data as any).message || 'An error occurred');
      }
    } catch (err) {
      console.log('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  // Map step IDs to audio file names
  const getAudioFileName = (stepId: string): string | null => {
    const audioMap: Record<string, string> = {
      'email': 'email.mp3',
      'password': 'password.mp3',
      'firstName': 'name.mp3',
      'farmName': 'farm_name.mp3',
      'mainCrop': 'main_crop.mp3',
      'farmSizeHectares': 'farm_size.mp3',
      'locationName': 'location.mp3',
    };
    return audioMap[stepId] || null;
  };

  // Play voice for current step using audio files
  const playStepVoice = useCallback((stepIndex: number) => {
    const step = signupSteps[stepIndex];
    if (!step) return;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Cancel any speech synthesis if running
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const audioFileName = getAudioFileName(step.id);
    if (!audioFileName) {
      console.warn(`No audio file found for step: ${step.id}`);
      return;
    }

    const audioUrl = `${AUDIO_URL_PATH}/voice/${audioFileName}`;
    console.log('Audio URL:', audioUrl);
    const audio = new Audio(audioUrl);
    
    audio.onloadstart = () => setAudioPlaying(true);
    audio.onended = () => setAudioPlaying(false);
    audio.onerror = (e) => {
      console.error('Error playing audio:', e);
      setAudioPlaying(false);
    };
    
    audio.play().catch((err) => {
      console.error('Failed to play audio:', err);
      setAudioPlaying(false);
    });

    audioRef.current = audio;
  }, [signupSteps]);

  // Play voice when step changes
  useEffect(() => {
    if (!isLogin && signupStep >= 0) {
      playStepVoice(signupStep);
    }
    
    // Cleanup on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [signupStep, isLogin, playStepVoice]);

  const handleNext = () => {
    const currentStep = signupSteps[signupStep];
    // Validate required fields
    if (currentStep.required) {
      if (currentStep.id === 'coordinates') {
        // Coordinates step doesn't need validation
      } else if (!formData[currentStep.id as keyof typeof formData]) {
        setError(`${currentStep.label} is required`);
        return;
      }
    }
    setError('');
    if (signupStep < totalSteps - 1) {
      setSignupStep(signupStep + 1);
    }
  };

  const handleBack = () => {
    if (signupStep > 0) {
      setSignupStep(signupStep - 1);
      setError('');
    }
  };

  const handleSignupToggle = () => {
    setIsLogin(!isLogin);
    setSignupStep(0);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 animate-gradient"></div>

      {/* Floating Orbs - Dark Theme */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gray-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-gray-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-gray-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Glassmorphism Container */}
      <div className="max-w-md w-full relative z-10">
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-8">
          {/* Logo & Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg transform hover:scale-105 transition-all duration-300">
                <Image
                  src="/logo.png"
                  alt="Company Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join Us'}
            </h2>
            <p className="text-sm text-white/80">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={handleSignupToggle}
                className="cursor-pointer font-semibold text-gray-300 hover:text-white transition-colors duration-200 underline underline-offset-4"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 backdrop-blur-xl border border-red-300/30 text-red-100 px-4 py-3 rounded-xl animate-shake">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Email Input with Floating Label */}
              {isLogin && <>
                <div className="floating-input-container">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="floating-input"
                    placeholder=" "
                  />
                  <label htmlFor="email" className="floating-label">
                    Email address
                  </label>
                </div>

                {/* Password Input with Floating Label */}
                <div className="floating-input-container">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    className="floating-input"
                    placeholder=" "
                  />
                  <label htmlFor="password" className="floating-label">
                    Password
                  </label>
                </div>
              </>}
              {/* Signup Multi-Step Wizard */}
              {!isLogin && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {signupSteps.map((step, index) => (
                          <div
                            key={step.id}
                            className={`flex-1 h-1 rounded-full transition-all ${index <= signupStep
                                ? 'bg-white/60'
                                : 'bg-white/20'
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-white/60 text-center">
                        Step {signupStep + 1} of {totalSteps}
                      </p>
                    </div>
                  </div>

                  {/* Step Description */}
                  <div className="mb-6 text-center">
                    <p className="text-white/80 text-sm leading-relaxed">
                      {signupSteps[signupStep]?.description}
                    </p>
                    {audioPlaying && (
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                        <span className="text-xs text-white/60">Playing audio...</span>
                      </div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="min-h-[200px]">
                    {signupStep === 0 && (
                      <div className="floating-input-container">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleNext();
                            }
                          }}
                          className="floating-input"
                          placeholder=" "
                          autoFocus
                        />
                        <label htmlFor="email" className="floating-label">
                          Email address
                        </label>
                      </div>
                    )}

                    {signupStep === 1 && (
                      <div className="floating-input-container">
                        <input
                          id="password"
                          name="password"
                          type="password"
                          required
                          minLength={6}
                          value={formData.password}
                          onChange={handleChange}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleNext();
                            }
                          }}
                          className="floating-input"
                          placeholder=" "
                          autoFocus
                        />
                        <label htmlFor="password" className="floating-label">
                          Password (min 6 characters)
                        </label>
                      </div>
                    )}

                    {signupStep === 2 && (
                      <div className="floating-input-container">
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleNext();
                            }
                          }}
                          className="floating-input"
                          placeholder=" "
                          autoFocus
                        />
                        <label htmlFor="firstName" className="floating-label">
                          First Name
                        </label>
                      </div>
                    )}

                    {signupStep === 3 && (
                      <div className="floating-input-container">
                        <input
                          id="farmName"
                          name="farmName"
                          type="text"
                          value={formData.farmName}
                          onChange={handleChange}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleNext();
                            }
                          }}
                          className="floating-input"
                          placeholder=" "
                          autoFocus
                        />
                        <label htmlFor="farmName" className="floating-label">
                          Farm Name (optional)
                        </label>
                      </div>
                    )}

                    {signupStep === 4 && (
                      <div className="floating-input-container">
                        <input
                          id="mainCrop"
                          name="mainCrop"
                          type="text"
                          value={formData.mainCrop}
                          onChange={handleChange}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleNext();
                            }
                          }}
                          className="floating-input"
                          placeholder=" "
                          autoFocus
                        />
                        <label htmlFor="mainCrop" className="floating-label">
                          Main Crop (optional)
                        </label>
                      </div>
                    )}

                    {signupStep === 5 && (
                      <div className="floating-input-container">
                        <input
                          id="farmSizeHectares"
                          name="farmSizeHectares"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.farmSizeHectares}
                          onChange={handleChange}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleNext();
                            }
                          }}
                          className="floating-input"
                          placeholder=" "
                          autoFocus
                        />
                        <label htmlFor="farmSizeHectares" className="floating-label">
                          Farm Size (Hectares) (optional)
                        </label>
                      </div>
                    )}

                    {signupStep === 6 && (
                      <div className="floating-input-container">
                        <input
                          ref={autocompleteRef}
                          id="locationName"
                          name="locationName"
                          type="text"
                          value={formData.locationName}
                          onChange={handleChange}
                          onKeyDown={(e) => {
                            // Prevent form submission on Enter when selecting from autocomplete
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              // Small delay to allow autocomplete to process
                              setTimeout(() => handleNext(), 100);
                            }
                          }}
                          className="floating-input"
                          placeholder=" "
                          autoFocus
                          disabled={!googleLoaded}
                        />
                        <label htmlFor="locationName" className="floating-label">
                          {googleLoaded ? 'Start typing your location...' : 'Loading location services...'}
                        </label>
                        {!googleLoaded && (
                          <div className="text-xs text-white/60 mt-2 space-y-1">
                            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                              <p>Loading Google Maps...</p>
                            ) : (
                              <div>
                                <p className="text-yellow-400 mb-1">⚠️ Google Maps API key not configured</p>
                                <p>Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file</p>
                                <p className="text-xs mt-1 opacity-75">Get your key from: console.cloud.google.com</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}


                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current = null;
                        }
                        if ('speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                        }
                        handleBack();
                      }}
                      disabled={signupStep === 0}
                      className={`px-4 py-2 rounded-xl transition-all ${signupStep === 0
                          ? 'opacity-50 cursor-not-allowed'
                          : 'bg-white/10 hover:bg-white/20 text-white cursor-pointer'
                        }`}
                    >
                      Back
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => playStepVoice(signupStep)}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                        title="Replay audio"
                      >
                        🔊
                      </button>
                      {signupStep < totalSteps - 1 ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (audioRef.current) {
                              audioRef.current.pause();
                              audioRef.current = null;
                            }
                            if ('speechSynthesis' in window) {
                              window.speechSynthesis.cancel();
                            }
                            handleNext();
                          }}
                          className="px-6 py-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-500 hover:to-gray-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={loading}
                          onClick={() => {
                            if (audioRef.current) {
                              audioRef.current.pause();
                              audioRef.current = null;
                            }
                            if ('speechSynthesis' in window) {
                              window.speechSynthesis.cancel();
                            }
                          }}
                          className="px-6 py-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-500 hover:to-gray-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-500 hover:to-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl shadow-lg"
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Create Account')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        /* Floating Label Container */
        .floating-input-container {
          position: relative;

        }

        /* Floating Input Styles */
        .floating-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 0.75rem;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .floating-input:hover {
          
        }

        .floating-input:focus {
          border-color: rgba(156, 163, 175, 0.8);
          box-shadow: 0 0 0 2px rgba(156, 163, 175, 0.4);
        }

        /* Floating Label Styles - Positioned OUTSIDE the input */
        .floating-label {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
          font-weight: 500;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          padding: 0 0.25rem;
        }

        /* Label moves ABOVE the input box when focused or filled */
        .floating-input:focus ~ .floating-label,
        .floating-input:not(:placeholder-shown) ~ .floating-label {
          top: 0;
          left: 0.75rem;
          transform: translateY(-90%) scale(0.85);
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
         
          padding: 0 0.5rem;
        }

        /* Special handling for select elements - label always stays above */
        .floating-label-select {
          position: absolute;
          left: 0.75rem;
          top: 0;
          transform: translateY(-50%) scale(0.85);
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          font-weight: 600;
          pointer-events: none;
          background: linear-gradient(to bottom, transparent 40%, rgba(0, 0, 0, 0.8) 40%, rgba(0, 0, 0, 0.8) 60%, transparent 60%);
          padding: 0 0.5rem;
        }

        select.floating-input {
          cursor: pointer;
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-shake {
          animation: shake 0.5s;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
