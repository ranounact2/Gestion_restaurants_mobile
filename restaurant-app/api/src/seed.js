require('dotenv').config();
const { db, COLLECTIONS } = require('./config/firebase');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminRef = db.collection(COLLECTIONS.USERS).doc();
    const adminData = {
      id: adminRef.id,
      name: 'Admin User',
      email: 'admin@restaurant.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await adminRef.set(adminData);
    console.log('✅ Admin user created');

    // Create test customer
    const customerPassword = await bcrypt.hash('customer123', 12);
    const customerRef = db.collection(COLLECTIONS.USERS).doc();
    const customerData = {
      id: customerRef.id,
      name: 'Test Customer',
      email: 'customer@test.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await customerRef.set(customerData);
    console.log('✅ Customer user created');

    // Create restaurants
    const restaurants = [
      {
        name: 'Pizza Palace',
        description: 'Authentic Italian pizzas with fresh ingredients',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
        rating: 4.5,
        deliveryFee: 2.99,
        eta: 30,
        latitude: 48.8566,
        longitude: 2.3522,
        isActive: true
      },
      {
        name: 'Burger House',
        description: 'Juicy burgers and crispy fries',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
        rating: 4.2,
        deliveryFee: 1.99,
        eta: 25,
        latitude: 48.8606,
        longitude: 2.3376,
        isActive: true
      },
      {
        name: 'Sushi Express',
        description: 'Fresh sushi and Japanese cuisine',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
        rating: 4.7,
        deliveryFee: 3.99,
        eta: 35,
        latitude: 48.8534,
        longitude: 2.3488,
        isActive: true
      }
    ];

    const createdRestaurants = [];
    for (const restaurantData of restaurants) {
      const restaurantRef = db.collection(COLLECTIONS.RESTAURANTS).doc();
      const restaurant = {
        id: restaurantRef.id,
        ...restaurantData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await restaurantRef.set(restaurant);
      createdRestaurants.push(restaurant);
    }
    console.log('✅ Restaurants created');

    // Create menu items
    const menuItems = [
      // Pizza Palace
      {
        restaurantId: createdRestaurants[0].id,
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500',
        category: 'Pizza',
        isAvailable: true
      },
      {
        restaurantId: createdRestaurants[0].id,
        name: 'Pepperoni Pizza',
        description: 'Spicy pepperoni with mozzarella cheese',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
        category: 'Pizza',
        isAvailable: true
      },
      {
        restaurantId: createdRestaurants[0].id,
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with caesar dressing',
        price: 8.99,
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500',
        category: 'Salads',
        isAvailable: true
      },
      
      // Burger House
      {
        restaurantId: createdRestaurants[1].id,
        name: 'Classic Burger',
        description: 'Beef patty with lettuce, tomato, and special sauce',
        price: 10.99,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
        category: 'Burgers',
        isAvailable: true
      },
      {
        restaurantId: createdRestaurants[1].id,
        name: 'Cheese Burger',
        description: 'Classic burger with melted cheese',
        price: 11.99,
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500',
        category: 'Burgers',
        isAvailable: true
      },
      {
        restaurantId: createdRestaurants[1].id,
        name: 'French Fries',
        description: 'Crispy golden fries',
        price: 4.99,
        image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500',
        category: 'Sides',
        isAvailable: true
      },
      
      // Sushi Express
      {
        restaurantId: createdRestaurants[2].id,
        name: 'Salmon Roll',
        description: 'Fresh salmon with avocado and cucumber',
        price: 8.99,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
        category: 'Rolls',
        isAvailable: true
      },
      {
        restaurantId: createdRestaurants[2].id,
        name: 'Tuna Sashimi',
        description: 'Fresh tuna slices',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=500',
        category: 'Sashimi',
        isAvailable: true
      },
      {
        restaurantId: createdRestaurants[2].id,
        name: 'Miso Soup',
        description: 'Traditional Japanese soup',
        price: 3.99,
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500',
        category: 'Soups',
        isAvailable: true
      }
    ];

    for (const menuItemData of menuItems) {
      const menuItemRef = db.collection(COLLECTIONS.MENU_ITEMS).doc();
      const menuItem = {
        id: menuItemRef.id,
        ...menuItemData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await menuItemRef.set(menuItem);
    }
    console.log('✅ Menu items created');

    // Create sample address for customer
    const addressRef = db.collection(COLLECTIONS.ADDRESSES).doc();
    await addressRef.set({
      id: addressRef.id,
      userId: customerRef.id,
      label: 'Home',
      line1: '123 Main Street',
      city: 'Paris',
      postalCode: '75001',
      latitude: 48.8566,
      longitude: 2.3522,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Sample address created');

    // Create sample reviews
    const reviews = [
      {
        userId: customerRef.id,
        restaurantId: createdRestaurants[0].id,
        rating: 5,
        comment: 'Amazing pizza! Fresh ingredients and great taste.'
      },
      {
        userId: customerRef.id,
        restaurantId: createdRestaurants[1].id,
        rating: 4,
        comment: 'Good burgers, fast delivery.'
      }
    ];

    for (const reviewData of reviews) {
      const reviewRef = db.collection(COLLECTIONS.REVIEWS).doc();
      await reviewRef.set({
        id: reviewRef.id,
        ...reviewData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log('✅ Reviews created');

    console.log('✅ Database seeding completed!');
    console.log('👤 Admin: admin@restaurant.com / admin123');
    console.log('👤 Customer: customer@test.com / customer123');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('✅ Seed completed successfully');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  });
