// Farmer dashboard: post/manage produce, buy supplies, credit shop
import { Marketplace } from '../components/Marketplace.jsx';
export function FarmerModule() {
  const [produce, setProduce] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProduce = () => {
    setLoading(true);
    fetchProduce()
      .then(setProduce)
      .catch(() => setError('Failed to load produce.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProduce();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <PostProduce onPosted={loadProduce} />
      <h2>My Produce Listings</h2>
      <ul>
        {produce.map((item) => (
          <li key={item.id}>{item.name} - {item.quantity_available} {item.unit} @ {item.price_per_unit}</li>
        ))}
      </ul>
    </div>
  );
}
