# Linking Frontend to Backend

## 1. Axios Example (React)
```tsx
import axios from 'axios';

// Example POST request
axios.post('http://localhost:3001/api/dealer', {
  name: 'Dealer Name',
  email: 'dealer@email.com',
  phone: '1234567890',
}).then(res => {
  console.log(res.data);
}).catch(err => {
  console.error(err);
});

// Example GET request
axios.get('http://localhost:3001/api/dealer').then(res => {
  console.log(res.data);
});
```

## 2. Fetch Example (Vanilla JS)
```js
fetch('http://localhost:3001/api/dealer')
  .then(res => res.json())
  .then(data => console.log(data));
```

## 3. CORS
- Ensure `CORS_ORIGIN` in backend `.env` matches your frontend URL
