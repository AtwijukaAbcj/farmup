// Mock react-native-maps for web platform
import { View } from 'react-native';

// Mock MapView component
const MapView = (props) => {
  return View(props);
};

// Mock Marker component  
const Marker = (props) => {
  return View(props);
};

export default MapView;
export { Marker };