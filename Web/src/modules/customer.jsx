// Customer dashboard: browse/buy produce, view orders
import { Marketplace } from '../components/Marketplace.jsx';
export function CustomerModule() {
  return (
    <div>
      <h2>Customer Marketplace</h2>
      <ul>
        <li>Browse and buy fresh produce (coming soon)</li>
        <li>View your orders (coming soon)</li>
      </ul>
      <Marketplace />
    </div>
  );
}
