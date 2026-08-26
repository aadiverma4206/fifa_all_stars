import React, { useState } from 'react';
import { Building2, MapPin, Clock, ShieldCheck, CheckSquare, Save } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import ManagerNav from '../../components/club/ManagerNav';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export const ManageClubPage = () => {
  const { clubs, updateClub } = useDataStore();
  const { currentUser } = useAuthStore();

  const myClub = clubs.find(c => c.managerIds?.includes(currentUser?.id)) || clubs[0];

  const [name, setName] = useState(myClub?.name || '');
  const [address, setAddress] = useState(myClub?.address || '');
  const [city, setCity] = useState(myClub?.city || 'Raipur');
  const [lat, setLat] = useState(myClub?.geoCoordinates?.lat || 21.2497);
  const [lng, setLng] = useState(myClub?.geoCoordinates?.lng || 81.6584);
  const [openTime, setOpenTime] = useState(myClub?.operatingHours?.open || '06:00');
  const [closeTime, setCloseTime] = useState(myClub?.operatingHours?.close || '23:00');
  const [clubImageUrl, setClubImageUrl] = useState(myClub?.clubImageUrl || '/src/assets/images/courts/court-1.jpg');
  const [description, setDescription] = useState(myClub?.description || '');

  const availableAmenities = ['Floodlights', 'Pro Shop', 'Washrooms', 'Parking', 'Cafeteria', 'Changing Rooms', 'Free WiFi'];
  const [selectedAmenities, setSelectedAmenities] = useState(myClub?.amenities || availableAmenities);

  const localCourtImages = [
    '/src/assets/images/courts/court-1.jpg',
    '/src/assets/images/courts/court-2.jpg',
    '/src/assets/images/courts/court-3.jpg',
    '/src/assets/images/courts/court-4.jpg',
    '/src/assets/images/courts/court-5.jpg',
    '/src/assets/images/courts/court-6.jpg'
  ];

  const handleAmenityToggle = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleSaveClub = (e) => {
    e.preventDefault();
    updateClub(myClub.id, {
      name,
      address,
      city,
      geoCoordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
      operatingHours: { open: openTime, close: closeTime },
      amenities: selectedAmenities,
      clubImageUrl,
      description
    });
  };

  return (
    <div className="space-y-6 py-4 max-w-5xl mx-auto">
      <ManagerNav />

      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Manage Venue Details
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Edit club profile, operating hours, amenities, and court cover photos
        </p>
      </div>

      <form onSubmit={handleSaveClub} className="footy-card p-6 sm:p-8 space-y-6">
        
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Basic Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Venue / Club Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500"
              >
                <option value="Raipur">Raipur</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Pune">Pune</option>
              </select>
            </div>
          </div>

          <div className="text-xs font-bold">
            <label className="block text-slate-700 dark:text-slate-300 mb-1">Full Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sport-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Operating Hours</h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Opening Time</label>
              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Closing Time</label>
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Amenities Checkboxes */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Venue Amenities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
            {availableAmenities.map((amenity) => (
              <label
                key={amenity}
                className={`p-3 rounded-2xl border flex items-center space-x-2 cursor-pointer transition-all ${
                  selectedAmenities.includes(amenity)
                    ? 'bg-sport-500/10 border-sport-500 text-sport-500'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="accent-sport-500"
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Image Selection */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Select Venue Cover Photo</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {localCourtImages.map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => setClubImageUrl(imgUrl)}
                className={`h-24 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                  clubImageUrl === imgUrl ? 'border-sport-500 ring-2 ring-sport-500' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt={`Court ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <Button type="submit" variant="primary" size="lg" icon={Save}>
            Save Venue Profile
          </Button>
        </div>

      </form>
    </div>
  );
};

export default ManageClubPage;
