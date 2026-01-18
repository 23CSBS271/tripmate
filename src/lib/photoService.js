const defaultPhotos = [
  'https://images.pexels.com/photos/2265876/pexels-photo-2265876.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg?auto=compress&cs=tinysrgb&w=1600',
];

const cityPhotos = {
  'paris': 'https://images.pexels.com/photos/20818273/pexels-photo-20818273.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'london': 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'tokyo': 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'new york': 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'rome': 'https://images.pexels.com/photos/2676640/pexels-photo-2676640.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'barcelona': 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'dubai': 'https://images.pexels.com/photos/1470502/pexels-photo-1470502.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'sydney': 'https://images.pexels.com/photos/995765/pexels-photo-995765.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'bali': 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'maldives': 'https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'mysuru': 'https://images.pexels.com/photos/34925511/pexels-photo-34925511.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'mysore': 'https://images.pexels.com/photos/34925511/pexels-photo-34925511.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'delhi': 'https://images.pexels.com/photos/19756444/pexels-photo-19756444.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'mumbai': 'https://images.pexels.com/photos/1682748/pexels-photo-1682748.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'agra': 'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'jaipur': 'https://images.pexels.com/photos/19149591/pexels-photo-19149591.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'goa': 'https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'kerala': 'https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'bangalore': 'https://images.pexels.com/photos/739407/pexels-photo-739407.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'bengaluru': 'https://images.pexels.com/photos/739407/pexels-photo-739407.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'kolkata': 'https://images.pexels.com/photos/2846217/pexels-photo-2846217.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'varanasi': 'https://images.pexels.com/photos/5473214/pexels-photo-5473214.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'udaipur': 'https://images.pexels.com/photos/570031/pexels-photo-570031.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'singapore': 'https://images.pexels.com/photos/777059/pexels-photo-777059.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'bangkok': 'https://images.pexels.com/photos/1031659/pexels-photo-1031659.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'amsterdam': 'https://images.pexels.com/photos/208733/pexels-photo-208733.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'venice': 'https://images.pexels.com/photos/208733/pexels-photo-208733.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'istanbul': 'https://images.pexels.com/photos/1129784/pexels-photo-1129784.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'prague': 'https://images.pexels.com/photos/792032/pexels-photo-792032.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'santorini': 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'iceland': 'https://images.pexels.com/photos/2832034/pexels-photo-2832034.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'switzerland': 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=1600',
};

export const getDestinationPhoto = (destination) => {
  if (!destination) return getDefaultTripPhoto();

  const searchTerm = destination.split(',')[0].trim().toLowerCase();

  if (cityPhotos[searchTerm]) {
    return cityPhotos[searchTerm];
  }

  return getDefaultTripPhoto();
};

export const getDefaultTripPhoto = () => {
  return 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1600';
};
