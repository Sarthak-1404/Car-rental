-- Create database
CREATE DATABASE IF NOT EXISTS car_rental;
USE car_rental;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT false,
    role ENUM('user', 'admin') DEFAULT 'user',
    reward_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    seats INT NOT NULL,
    luggage INT NOT NULL,
    transmission VARCHAR(50) NOT NULL,
    air_conditioning BOOLEAN DEFAULT true,
    price_per_day DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    description TEXT,
    available BOOLEAN DEFAULT true,
    features JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    car_id INT NOT NULL,
    user_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    points_earned INT NOT NULL,
    booking_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('booking', 'reward', 'system') NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- OTP table for verification
CREATE TABLE IF NOT EXISTS otp (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample cars
INSERT INTO cars (name, model, year, type, seats, luggage, transmission, price_per_day, image_url, description, features) VALUES
('Toyota Camry', 'Camry', 2022, 'Sedan', 5, 2, 'Automatic', 50.00, 'https://example.com/camry.jpg', 'Comfortable and reliable sedan perfect for family trips', '{"bluetooth": true, "gps": true, "backup_camera": true}'),
('Honda Civic', 'Civic', 2023, 'Sedan', 5, 2, 'Automatic', 45.00, 'https://example.com/civic.jpg', 'Fuel-efficient and stylish compact car', '{"bluetooth": true, "gps": true, "backup_camera": true}'),
('Ford Mustang', 'Mustang', 2022, 'Sports', 4, 2, 'Manual', 80.00, 'https://example.com/mustang.jpg', 'Classic American muscle car for an exciting driving experience', '{"bluetooth": true, "gps": true, "backup_camera": true, "sport_mode": true}'),
('Jeep Wrangler', 'Wrangler', 2023, 'SUV', 5, 3, 'Manual', 75.00, 'https://example.com/wrangler.jpg', 'Adventure-ready SUV perfect for off-road exploration', '{"bluetooth": true, "gps": true, "backup_camera": true, "off_road_mode": true}'); 