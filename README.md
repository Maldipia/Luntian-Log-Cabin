# Luntian-Log-Cabin
Luntian Log Cabin is a nature-inspired staycation located in Tagaytay, perfect for couples, families, and small groups seeking peace, privacy, and a rustic escape just a few hours from Manila. Nestled in a serene environment filled with trees, native touches, and calming landscapes, offers a refreshing experience that reconnects you with nature.
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Luntian Log Cabin - Tagaytay's Hidden Gem | 5 Private Rooms | Pet-Friendly</title>
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="Luntian Log Cabin - Tagaytay's hidden gem with 5 private rooms, AC & WiFi. From ₱1,999/night. Pet-friendly nature escape in Asisan, Tagaytay.">
    <meta name="keywords" content="Luntian Log Cabin, Tagaytay staycation, pet-friendly cabin, Airbnb Tagaytay, VRBO, nature escape, private rooms, AC WiFi">
    
    <!-- Open Graph for Social Media -->
    <meta property="og:title" content="Luntian Log Cabin - Tagaytay's Hidden Gem for Rest & Wellness">
    <meta property="og:description" content="5 private rooms, pet-friendly, AC & WiFi. From ₱1,999/night. Your nature-inspired getaway in Asisan, Tagaytay.">
    <meta property="og:type" content="website">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            overflow-x: hidden;
            background: #F5F5DC;
        }

        /* Promo Banner */
        .promo-banner {
            background: linear-gradient(45deg, #FF4444, #FF6666);
            color: white;
            text-align: center;
            padding: 12px 20px;
            font-weight: bold;
            position: relative;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.8; }
            100% { opacity: 1; }
        }

        .promo-banner .close-promo {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
        }

        /* Navigation */
        .nav {
            position: fixed;
            top: 0;
            width: 100%;
            background: rgba(101, 67, 33, 0.95);
            backdrop-filter: blur(10px);
            z-index: 1000;
            padding: 15px 0;
            transition: all 0.3s ease;
            margin-top: 45px;
        }

        .nav.scrolled {
            background: rgba(101, 67, 33, 0.98);
            padding: 10px 0;
            margin-top: 0;
        }

        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 1.8em;
            font-weight: bold;
            color: white;
            text-decoration: none;
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 30px;
        }

        .nav-links a {
            color: white;
            text-decoration: none;
            transition: color 0.3s ease;
            font-weight: 500;
        }

        .nav-links a:hover {
            color: #C8E6C9;
        }

        .mobile-menu {
            display: none;
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
        }

        /* Hero Section */
        .hero {
            height: 100vh;
            background: background: linear-gradient(rgba(101, 67, 33, 0.4), rgba(139, 69, 19, 0.4)), 
            url('coverpage.jpg');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
            position: relative;
            margin-top: 45px;
        }

        .hero-content {
            max-width: 900px;
            padding: 0 20px;
            animation: fadeInUp 1s ease-out;
        }

        .hero h1 {
            font-size: 4em;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            font-weight: 300;
        }

        .hero .tagline {
            font-size: 1.6em;
            margin-bottom: 15px;
            color: #F5DEB3;
            font-weight: 500;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
        }

        .hero .subtitle {
            font-size: 1.3em;
            margin-bottom: 20px;
            color: #F0F8FF;
            font-weight: 300;
        }

        .hero .location {
            font-size: 1.1em;
            margin-bottom: 30px;
            color: #E6F3E6;
        }

        .hero .promo-highlight {
            background: linear-gradient(45deg, #FF4444, #FF6666);
            padding: 15px 25px;
            border-radius: 25px;
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 40px;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: pulse 3s infinite;
        }

        .cta-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            padding: 15px 35px;
            border: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .btn-primary {
            background: #1B5E20;
            color: white;
        }

        .btn-primary:hover {
            background: #0D4E17;
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }

        .btn-secondary {
            background: transparent;
            color: white;
            border: 2px solid white;
        }

        .btn-secondary:hover {
            background: white;
            color: #2E7D32;
        }

        /* About Section */
        .about {
            padding: 100px 0;
            background: #F5F5DC;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        .section-title {
            text-align: center;
            font-size: 2.5em;
            margin-bottom: 20px;
            color: #654321;
            font-weight: 300;
        }

        .section-subtitle {
            text-align: center;
            font-size: 1.2em;
            color: #666;
            margin-bottom: 60px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }

        .about-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
        }

        .about-content {
            font-size: 1.1em;
            line-height: 1.8;
            color: #555;
        }

        .about-content p {
            margin-bottom: 20px;
        }

        .highlight {
            color: #228B22;
            font-weight: bold;
        }

        .features-list {
            list-style: none;
            margin: 20px 0;
        }

        .features-list li {
            padding: 8px 0;
            color: #555;
        }

        .features-list li:before {
            content: "🏠 ";
            margin-right: 10px;
        }

        .about-image {
            background: linear-gradient(45deg, #228B22, #32CD32);
            height: 400px;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2em;
            text-align: center;
        }

        /* Rooms Section */
        .rooms {
            padding: 100px 0;
            background: linear-gradient(135deg, #F5F5DC 0%, #F0F8E7 100%);
        }

        .rooms-intro {
            text-align: center;
            margin-bottom: 50px;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 15px;
        }

        .rooms-intro h3 {
            color: #654321;
            font-size: 1.8em;
            margin-bottom: 15px;
        }

        .rooms-intro .room-count {
            font-size: 1.3em;
            color: #8B4513;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .rooms-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 40px;
            margin-top: 60px;
        }

        .room-card {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 8px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
            backdrop-filter: blur(10px);
        }

        .room-card:hover {
            transform: translateY(-10px);
        }

        .room-image {
            height: 250px;
            background: linear-gradient(45deg, #8B4513, #D2691E);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.1em;
        }

        .room-content {
            padding: 30px;
        }

        .room-title {
            font-size: 1.5em;
            color: #654321;
            margin-bottom: 15px;
            font-weight: bold;
        }

        .room-description {
            color: #666;
            margin-bottom: 20px;
            line-height: 1.6;
        }

        .room-features {
            list-style: none;
            margin-bottom: 25px;
        }

        .room-features li {
            padding: 5px 0;
            color: #555;
        }

        .room-features li:before {
            content: "✓ ";
            color: #228B22;
            font-weight: bold;
            margin-right: 8px;
        }

        /* Pricing Section */
        .pricing {
            padding: 80px 0;
            background: #654321;
            color: white;
            text-align: center;
        }

        .pricing .section-title {
            color: white;
        }

        .pricing .section-subtitle {
            color: #F5DEB3;
        }

        .pricing-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 50px;
        }

        .pricing-card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 40px 30px;
            border: 2px solid rgba(255,255,255,0.2);
            transition: transform 0.3s ease;
        }

        .pricing-card:hover {
            transform: translateY(-5px);
            background: rgba(255,255,255,0.15);
        }

        .pricing-type {
            font-size: 1.3em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #F5DEB3;
        }

        .pricing-amount {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
            color: white;
        }

        .pricing-period {
            color: #F0F8FF;
            margin-bottom: 20px;
        }

        .pricing-features {
            list-style: none;
            text-align: left;
        }

        .pricing-features li {
            padding: 8px 0;
            color: #F0F8FF;
        }

        .pricing-features li:before {
            content: "✓ ";
            color: #228B22;
            font-weight: bold;
            margin-right: 8px;
        }

        /* Amenities Section */
        .amenities {
            padding: 100px 0;
            background: #F5F5DC;
        }

        .amenities-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 40px;
            margin-top: 60px;
        }

        .amenity-card {
            text-align: center;
            padding: 40px 20px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            transition: transform 0.3s ease;
            backdrop-filter: blur(10px);
        }

        .amenity-card:hover {
            transform: translateY(-5px);
        }

        .amenity-icon {
            font-size: 3em;
            margin-bottom: 20px;
            display: block;
        }

        .amenity-title {
            font-size: 1.3em;
            color: #654321;
            margin-bottom: 15px;
            font-weight: bold;
        }

        .amenity-description {
            color: #666;
            line-height: 1.6;
        }

        /* Platform Badges */
        .platforms {
            padding: 80px 0;
            background: linear-gradient(135deg, #F0F8E7 0%, #F5F5DC 100%);
            text-align: center;
        }

        .platform-badges {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 40px;
            margin-top: 40px;
            flex-wrap: wrap;
        }

        .platform-badge {
            background: rgba(255, 255, 255, 0.95);
            padding: 20px 30px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            text-decoration: none;
            color: #333;
            font-weight: bold;
            transition: transform 0.3s ease;
            min-width: 150px;
            backdrop-filter: blur(10px);
        }

        .platform-badge:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }

        .platform-icon {
            font-size: 2em;
            margin-bottom: 10px;
            display: block;
        }

        /* Reviews Section */
        .reviews {
            padding: 100px 0;
            background: #F5F5DC;
        }

        .reviews-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 60px;
        }

        .review-card {
            background: rgba(255, 255, 255, 0.9);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            text-align: center;
            backdrop-filter: blur(10px);
        }

        .review-text {
            font-size: 1.1em;
            color: #555;
            font-style: italic;
            margin-bottom: 20px;
            line-height: 1.6;
        }

        .review-rating {
            color: #FFD700;
            font-size: 1.5em;
            margin-bottom: 15px;
        }

        .review-author {
            color: #654321;
            font-weight: bold;
        }

        /* Gallery Section */
        .gallery {
            padding: 100px 0;
            background: linear-gradient(135deg, #F5F5DC 0%, #F0F8E7 100%);
        }

        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 60px;
        }

        .gallery-item {
            height: 250px;
            background: linear-gradient(45deg, #228B22, #32CD32);
            border-radius: 10px;
            cursor: pointer;
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }

        .gallery-item:hover {
            transform: scale(1.05);
        }

        /* Contact Section */
        .contact {
            padding: 100px 0;
            background: #F5F5DC;
        }

        .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            margin-top: 60px;
        }

        .contact-info {
            background: rgba(255, 255, 255, 0.9);
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            backdrop-filter: blur(10px);
        }

        .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 25px;
            padding: 15px;
            background: white;
            border-radius: 8px;
        }

        .contact-icon {
            font-size: 1.5em;
            margin-right: 15px;
            color: #654321;
            width: 30px;
        }

        .booking-platforms {
            margin-top: 30px;
        }

        .platform-links {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            margin-top: 15px;
        }

        .platform-btn {
            padding: 12px 20px;
            background: #654321;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            transition: background 0.3s ease;
        }

        .platform-btn:hover {
            background: #8B4513;
        }

        .contact-form {
            background: rgba(255, 255, 255, 0.9);
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            backdrop-filter: blur(10px);
        }

        .form-group {
            margin-bottom: 25px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: bold;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: #228B22;
        }

        /* Footer */
        .footer {
            background: #654321;
            color: white;
            padding: 60px 0 30px;
            text-align: center;
        }

        .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        .footer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 40px;
            margin-bottom: 40px;
        }

        .footer-section h3 {
            margin-bottom: 20px;
            color: #F5DEB3;
        }

        .footer-section p,
        .footer-section a {
            color: #F0F8FF;
            text-decoration: none;
            line-height: 1.6;
        }

        .footer-section a:hover {
            color: white;
        }

        .social-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 20px;
        }

        .social-links a {
            font-size: 1.5em;
            color: #F5DEB3;
            transition: color 0.3s ease;
        }

        .social-links a:hover {
            color: white;
        }

        .footer-bottom {
            border-top: 1px solid #8B4513;
            padding-top: 30px;
            color: #F5DEB3;
        }

        /* Booking Modal */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 2000;
            backdrop-filter: blur(5px);
        }

        .modal-content {
            background: white;
            max-width: 600px;
            width: 90%;
            margin: 50px auto;
            border-radius: 15px;
            overflow: hidden;
            max-height: 90vh;
            overflow-y: auto;
        }

        .modal-header {
            background: #654321;
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-title {
            font-size: 1.5em;
            font-weight: bold;
        }

        .close-modal {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
        }

        .modal-body {
            padding: 30px;
        }

        .date-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .success-message {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            text-align: center;
        }

        .error-message {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            text-align: center;
        }

        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .fade-in {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }

        .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }

            .mobile-menu {
                display: block;
            }

            .hero h1 {
                font-size: 2.5em;
            }

            .hero .tagline {
                font-size: 1.3em;
            }

            .hero .subtitle {
                font-size: 1.1em;
            }

            .about-grid,
            .contact-grid {
                grid-template-columns: 1fr;
                gap: 40px;
            }

            .rooms-grid {
                grid-template-columns: 1fr;
            }

            .amenities-grid {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            }

            .pricing-grid {
                grid-template-columns: 1fr;
            }

            .cta-buttons {
                flex-direction: column;
                align-items: center;
            }

            .date-row {
                grid-template-columns: 1fr;
            }

            .platform-links {
                justify-content: center;
            }

            .platform-badges {
                gap: 20px;
            }

            .nav {
                margin-top: 45px;
            }

            .nav.scrolled {
                margin-top: 0;
            }
        }

        @media (max-width: 480px) {
            .hero h1 {
                font-size: 2em;
            }

            .section-title {
                font-size: 2em;
            }

            .modal-content {
                margin: 20px auto;
                width: 95%;
            }

            .platform-badge {
                min-width: 120px;
                padding: 15px 20px;
            }
        }
    </style>
</head>
<body>
    <!-- Promo Banner -->
    <div class="promo-banner" id="promoBanner">
        🔥 HUGE SAVINGS! Weeknight Special: Was ₱4,500 NOW ₱1,999 | Weekend with Breakfast: Was ₱7,000 NOW ₱2,499 🔥
        <button class="close-promo" onclick="closePromoBanner()">&times;</button>
    </div>

    <!-- Navigation -->
    <nav class="nav" id="navbar">
        <div class="nav-container">
            <a href="#home" class="logo">🌿 Luntian Log Cabin</a>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#rooms">Rooms</a></li>
                <li><a href="#amenities">Amenities</a></li>
                <li><a href="#reviews">Reviews</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <button class="mobile-menu" onclick="toggleMobileMenu()">☰</button>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero">
        <div class="hero-content">
            <h1>🌿 Luntian Log Cabin</h1>
            <p class="tagline">Tagaytay's Hidden Gem for Rest & Wellness</p>
            <p class="subtitle">Your Nature-Inspired Getaway with 2 Airbnb Rooms</p>
            <p class="location">📍 Asisan, Tagaytay - Pet-Friendly | AC & WiFi | Native & Cozy Vibe</p>
            <div class="promo-highlight">
                🔥 MASSIVE SAVINGS: Up to ₱4,500 OFF! From ₱1,999/night 🔥
            </div>
            <div class="cta-buttons">
                <a href="#" class="btn btn-primary" onclick="openBookingModal()">🏨 Book Your Stay</a>
                <a href="#about" class="btn btn-secondary">🌲 Discover More</a>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="about">
        <div class="container">
            <h2 class="section-title fade-in">About Luntian</h2>
            <p class="section-subtitle fade-in">A cozy cabin featuring 5 private rooms - your serene escape from city life</p>
            
            <div class="about-grid">
                <div class="about-content fade-in">
                    <p><span class="highlight">Luntian Log Cabin</span> is Tagaytay's hidden gem for rest, wellness, and nature-inspired getaways. Located in <span class="highlight">Asisan, Tagaytay</span>, we offer a perfect blend of tranquility and modern comfort.</p>
                    
                    <p>Our cozy cabin features <span class="highlight">2 beautiful private rooms</span> available on Airbnb, with a native & rustic aesthetic, ideal for couples, families, or solo travelers seeking peace and privacy just hours from Manila.</p>
                    
                    <ul class="features-list">
                        <li>2 private rooms available on Airbnb</li>
                        <li>Air conditioning and WiFi in all rooms</li>
                        <li>Pet-friendly accommodations (up to 2 small pets)</li>
                        <li>Shared living spaces: kitchen, dining, garden patio</li>
                        <li>Listed on Airbnb, Booking.com, and Agoda</li>
                    </ul>
                    
                    <p>Whether you're unwinding with <span class="highlight">birdsong in the morning</span> or <span class="highlight">stargazing at night</span>, Luntian offers a refreshing experience that reconnects you with nature while providing all modern conveniences.</p>
                </div>
                
                <div class="about-image fade-in">
                    <div>
                        <p>🏠 2 Airbnb Rooms</p>
                        <p>❄️ AC & WiFi</p>
                        <p>🐕 Pet-Friendly</p>
                        <p>🌿 Native Aesthetic</p>
                        <p>🌟 Hidden Gem</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Rooms Section -->
    <section id="rooms" class="rooms">
        <div class="container">
            <h2 class="section-title fade-in">Our 2 Airbnb Rooms</h2>
            <p class="section-subtitle fade-in">Both rooms available for booking on Airbnb, Booking.com, and Agoda</p>
            
            <div class="rooms-grid">
                <div class="room-card fade-in">
                    <div class="room-image">
                        <p>🛏️ Luntian Room 1 - Featured on Airbnb</p>
                    </div>
                    <div class="room-content">
                        <h3 class="room-title">Luntian Room 1</h3>
                        <p class="room-description">Cozy retreat with modern Filipino design, featuring handwoven pendant lights and natural materials. Perfect for couples.</p>
                        <ul class="room-features">
                            <li>Ideal for 2 guests</li>
                            <li>Air conditioning & WiFi</li>
                            <li>Handwoven pendant lighting</li>
                            <li>Natural rattan & wood design</li>
                            <li>Modern Filipino aesthetic</li>
                            <li>Featured on Airbnb</li>
                        </ul>
                        <div style="margin-bottom: 15px;">
                            <a href="https://www.airbnb.com/rooms/1276705378418419415" class="btn btn-primary" target="_blank" rel="noopener">🏡 Book Room 1 on Airbnb</a>
                        </div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <a href="https://www.booking.com/hotel/ph/luntian-room-1.html" class="platform-btn" target="_blank" rel="noopener">📘 Booking.com</a>
                            <a href="https://www.agoda.com/luntian-log-cabin-room-1/hotel/tagaytay-ph.html" class="platform-btn" target="_blank" rel="noopener">🛎️ Agoda</a>
                        </div>
                    </div>
                </div>
                
                <div class="room-card fade-in">
                    <div class="room-image">
                        <p>👨‍👩‍👧‍👦 Luntian Room 2 - Featured on Airbnb</p>
                    </div>
                    <div class="room-content">
                        <h3 class="room-title">Luntian Room 2</h3>
                        <p class="room-description">Spacious family accommodation with the same beautiful design elements, perfect for up to 4 guests to enjoy together.</p>
                        <ul class="room-features">
                            <li>Perfect for up to 4 guests</li>
                            <li>Air conditioning & WiFi</li>
                            <li>Family-friendly layout</li>
                            <li>Natural materials & warm lighting</li>
                            <li>Access to shared common areas</li>
                            <li>Featured on Airbnb</li>
                        </ul>
                        <div style="margin-bottom: 15px;">
                            <a href="https://www.airbnb.com/rooms/1276705378418419415" class="btn btn-primary" target="_blank" rel="noopener">🏡 Book Room 2 on Airbnb</a>
                        </div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <a href="https://www.booking.com/hotel/ph/luntian-room-2.html" class="platform-btn" target="_blank" rel="noopener">📘 Booking.com</a>
                            <a href="https://www.agoda.com/luntian-log-cabin-room-2/hotel/tagaytay-ph.html" class="platform-btn" target="_blank" rel="noopener">🛎️ Agoda</a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="fade-in" style="text-align: center; margin-top: 40px; padding: 30px; background: white; border-radius: 15px;">
                <h3 style="color: #654321; margin-bottom: 20px;">Complete Your Luntian Experience</h3>
                <p style="color: #666; line-height: 1.6;">Both rooms include access to our <strong>shared living spaces</strong>: rustic kitchen, dining area, garden patio, and bonfire space. Perfect for creating memorable moments with family and friends!</p>
                <div style="margin-top: 20px;">
                    <a href="https://www.airbnb.com/rooms/1276705378418419415" class="btn btn-primary" target="_blank" rel="noopener">🏡 View Rooms on Airbnb</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing">
        <div class="container">
            <h2 class="section-title fade-in">🔥 PROMO RATES - LIMITED TIME! 🔥</h2>
            <p class="section-subtitle fade-in">Save up to ₱4,500 per night on your Tagaytay getaway!</p>
            
            <div class="pricing-grid">
                <div class="pricing-card fade-in">
                    <div class="pricing-type">🔥 WEEKNIGHT PROMO 🔥</div>
                    <div style="text-decoration: line-through; color: #F0F8FF; font-size: 1.2em; margin-bottom: 5px;">₱4,500</div>
                    <div class="pricing-amount">₱1,999</div>
                    <div class="pricing-period">per night (Mon-Thu) | SAVE ₱2,501!</div>
                    <ul class="pricing-features">
                        <li>2 guests included</li>
                        <li>AC & WiFi</li>
                        <li>Access to all amenities</li>
                        <li>Extra person: +₱700</li>
                        <li>Pet-friendly</li>
                        <li style="color: #FFD700; font-weight: bold;">56% OFF Regular Rate!</li>
                    </ul>
                </div>
                
                <div class="pricing-card fade-in">
                    <div class="pricing-type">🌟 WEEKEND + BREAKFAST PROMO 🌟</div>
                    <div style="text-decoration: line-through; color: #F0F8FF; font-size: 1.2em; margin-bottom: 5px;">₱7,000</div>
                    <div class="pricing-amount">₱2,499</div>
                    <div class="pricing-period">per night (Fri-Sun) | SAVE ₱4,501!</div>
                    <ul class="pricing-features">
                        <li>2 guests included</li>
                        <li>Free breakfast for two</li>
                        <li>AC & WiFi</li>
                        <li>All shared amenities</li>
                        <li>Nature walks included</li>
                        <li>Bonfire experience</li>
                        <li style="color: #FFD700; font-weight: bold;">64% OFF Regular Rate!</li>
                    </ul>
                </div>
                
                <div class="pricing-card fade-in">
                    <div class="pricing-type">Platform Rates</div>
                    <div class="pricing-amount">Varies</div>
                    <div class="pricing-period">book on your favorite app</div>
                    <ul class="pricing-features">
                        <li>Available on Airbnb</li>
                        <li>Listed on VRBO</li>
                        <li>Book via Agoda</li>
                        <li>Booking.com rates</li>
                        <li>Secure payments</li>
                        <li>Instant confirmation</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Platform Badges -->
    <section class="platforms">
        <div class="container">
            <h2 class="section-title fade-in">Book on Your Favorite Platform</h2>
            <p class="section-subtitle fade-in">Choose the booking method that works best for you</p>
            
            <div class="platform-badges">
                <a href="https://www.airbnb.com/rooms/1276705378418419415" class="platform-badge fade-in" target="_blank" rel="noopener">
                    <span class="platform-icon">🏡</span>
                    Airbnb
                </a>
                <a href="https://www.booking.com/searchresults.html?ss=Luntian+Log+Cabin+Tagaytay" class="platform-badge fade-in" target="_blank" rel="noopener">
                    <span class="platform-icon">📘</span>
                    Booking.com
                </a>
                <a href="https://www.agoda.com/search?city=17193&checkIn=2024-12-01&checkOut=2024-12-02&rooms=1&adults=2&children=0&searchText=Luntian" class="platform-badge fade-in" target="_blank" rel="noopener">
                    <span class="platform-icon">🛎️</span>
                    Agoda
                </a>
            </div>
        </div>
    </section>

    <!-- Amenities Section -->
    <section id="amenities" class="amenities">
        <div class="container">
            <h2 class="section-title fade-in">Why Choose Luntian?</h2>
            <p class="section-subtitle fade-in">Modern comfort meets native charm in nature's embrace</p>
            
            <div class="amenities-grid">
                <div class="amenity-card fade-in">
                    <span class="amenity-icon">❄️</span>
                    <h3 class="amenity-title">Air Conditioning & WiFi</h3>
                    <p class="amenity-description">Stay comfortable with AC in all rooms and reliable WiFi for work or staying connected.</p>
                </div>
                
                <div class="amenity-card fade-in">
                    <span class="amenity-icon">🐕</span>
                    <h3 class="amenity-title">Pet-Friendly Haven</h3>
                    <p class="amenity-description">Bring your furry friends! We welcome up to 2 small pets with proper cleaning arrangements.</p>
                </div>
                
                <div class="amenity-card fade-in">
                    <span class="amenity-icon">🌅</span>
                    <h3 class="amenity-title">Mountain Air & Birdsong</h3>
                    <p class="amenity-description">Wake up to cool mountain air and the peaceful sounds of nature in our serene location.</p>
                </div>
                
                <div class="amenity-card fade-in">
                    <span class="amenity-icon">🏠</span>
                    <h3 class="amenity-title">Native Filipino Design</h3>
                    <p class="amenity-description">Thoughtfully designed interiors that blend native Filipino aesthetics with rustic charm.</p>
                </div>
                
                <div class="amenity-card fade-in">
                    <span class="amenity-icon">🧺</span>
                    <h3 class="amenity-title">Laundry Services</h3>
                    <p class="amenity-description">Convenient laundry facilities available for longer stays and family visits.</p>
                </div>
                
                <div class="amenity-card fade-in">
                    <span class="amenity-icon">🔥</span>
                    <h3 class="amenity-title">Bonfire Experience</h3>
                    <p class="amenity-description">Gather around our bonfire space for memorable evenings under the stars.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Reviews Section -->
    <section id="reviews" class="reviews">
        <div class="container">
            <h2 class="section-title fade-in">What Our Guests Say</h2>
            <p class="section-subtitle fade-in">Real experiences from our valued guests</p>
            
            <div class="reviews-grid">
                <div class="review-card fade-in">
                    <p class="review-text">"Bitin!!! Will stay longer next time."</p>
                    <div class="review-rating">⭐⭐⭐⭐⭐</div>
                    <p class="review-author">Happy Guest</p>
                </div>
                
                <div class="review-card fade-in">
                    <p class="review-text">"A quiet, calming place perfect for recharging."</p>
                    <div class="review-rating">⭐⭐⭐⭐⭐</div>
                    <p class="review-author">Nature Lover</p>
                </div>
                
                <div class="review-card fade-in">
                    <p class="review-text">"Thank you for the lovely breakfast and warm hospitality."</p>
                    <div class="review-rating">⭐⭐⭐⭐⭐</div>
                    <p class="review-author">Grateful Family</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Gallery Section -->
    <section id="gallery" class="gallery">
        <div class="container">
            <h2 class="section-title fade-in">Photo Gallery</h2>
            <p class="section-subtitle fade-in">Get a glimpse of your nature escape</p>
            
            <div class="gallery-grid">
                <div class="gallery-item fade-in" onclick="openImageModal('Cabin Exterior')">
                    🏡 Cabin Exterior
                </div>
                <div class="gallery-item fade-in" onclick="openImageModal('Private Rooms')">
                    🛏️ Private Rooms
                </div>
                <div class="gallery-item fade-in" onclick="openImageModal('Garden Patio')">
                    🌺 Garden Patio
                </div>
                <div class="gallery-item fade-in" onclick="openImageModal('Rustic Kitchen')">
                    🍽️ Rustic Kitchen
                </div>
                <div class="gallery-item fade-in" onclick="openImageModal('Bonfire Area')">
                    🔥 Bonfire Area
                </div>
                <div class="gallery-item fade-in" onclick="openImageModal('Nature Views')">
                    🌲 Nature Views
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="contact">
        <div class="container">
            <h2 class="section-title fade-in">Contact & Booking</h2>
            <p class="section-subtitle fade-in">Ready to book your nature escape? Get in touch!</p>
            
            <div class="contact-grid">
                <div class="contact-info fade-in">
                    <h3 style="color: #654321; margin-bottom: 30px;">Contact Information</h3>
                    
                    <div class="contact-item">
                        <span class="contact-icon">📍</span>
                        <div>
                            <strong>Location</strong><br>
                            Asisan, Tagaytay<br>
                            <a href="#" style="color: #654321;">📍 View on Waze</a>
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <span class="contact-icon">⏰</span>
                        <div>
                            <strong>Check-in / Check-out</strong><br>
                            Check-in: 2:00 PM<br>
                            Check-out: 12:00 NN
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <span class="contact-icon">📱</span>
                        <div>
                            <strong>Social Media</strong><br>
                            Facebook: Luntian Log Cabin<br>
                            Instagram: @luntianlogcabin
                        </div>
                    </div>
                    
                    <div class="booking-platforms">
                        <h4 style="color: #654321; margin-bottom: 15px;">Book Direct On:</h4>
                        <div class="platform-links">
                            <a href="https://www.airbnb.com/rooms/1276705378418419415" class="platform-btn" target="_blank" rel="noopener">🏡 Airbnb</a>
                            <a href="https://www.booking.com/searchresults.html?ss=Luntian+Log+Cabin+Tagaytay" class="platform-btn" target="_blank" rel="noopener">📘 Booking.com</a>
                            <a href="https://www.agoda.com/search?city=17193&checkIn=2024-12-01&checkOut=2024-12-02&rooms=1&adults=2&children=0&searchText=Luntian" class="platform-btn" target="_blank" rel="noopener">🛎️ Agoda</a>
                        </div>
                    </div>
                </div>
                
                <div class="contact-form fade-in">
                    <h3 style="color: #654321; margin-bottom: 30px;">Send Us a Message</h3>
                    
                    <form id="contactForm">
                        <div class="form-group">
                            <label>Your Name</label>
                            <input type="text" id="contactName" required placeholder="Full Name">
                        </div>
                        
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" id="contactEmail" required placeholder="your@email.com">
                        </div>
                        
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="tel" id="contactPhone" required placeholder="09XXXXXXXXX">
                        </div>
                        
                        <div class="form-group">
                            <label>Inquiry Type</label>
                            <select id="inquiryType" required>
                                <option value="">Select...</option>
                                <option value="booking">Booking Inquiry</option>
                                <option value="availability">Check Availability</option>
                                <option value="amenities">Amenities Question</option>
                                <option value="rates">Rate Information</option>
                                <option value="pets">Pet Policy</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Message</label>
                            <textarea id="contactMessage" rows="4" required placeholder="Tell us about your planned stay, questions, or special requests..."></textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width: 100%;">📧 Send Inquiry</button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-grid">
                <div class="footer-section">
                    <h3>🌿 Luntian Log Cabin</h3>
                    <p>Tagaytay's hidden gem with 2 beautiful Airbnb rooms. Experience tranquility, comfort, and authentic Filipino hospitality in our pet-friendly, nature-inspired retreat.</p>
                    <div class="social-links">
                        <a href="https://www.facebook.com/LuntianLogCabin" title="Facebook" target="_blank" rel="noopener">📘</a>
                        <a href="https://www.instagram.com/luntianlogcabin" title="Instagram" target="_blank" rel="noopener">📷</a>
                        <a href="https://www.airbnb.com/rooms/1276705378418419415" title="Airbnb" target="_blank" rel="noopener">🏡</a>
                    </div>
                </div>
                
                <div class="footer-section">
                    <h3>Sister Brands</h3>
                    <p><a href="https://www.facebook.com/LuntianLogCabin" target="_blank" rel="noopener">💍 The Gold Blessing - Affordable Gold Jewelry</a></p>
                    <p><a href="https://www.facebook.com/SoleBlessing" target="_blank" rel="noopener">👟 SoleBlessing - Sneaker Retail</a></p>
                    <p><a href="https://www.facebook.com/MustHaveCorner" target="_blank" rel="noopener">🐓 Must Have Corner - Farm-Fresh Produce</a></p>
                    <p style="margin-top: 15px; color: #A5D6A7;">Check our social media for exclusive promos & loyalty giveaways!</p>
                </div>
                
                <div class="footer-section">
                    <h3>House Rules</h3>
                    <p>• Check-in: 2PM | Check-out: 12NN</p>
                    <p>• Quiet hours: 9PM to 7AM</p>
                    <p>• Extra guests must be declared</p>
                    <p>• Pet-friendly (2 pets max, cleaning fee)</p>
                    <p>• Respect nature and fellow guests</p>
                    <p>• Clean shared spaces after use</p>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2024 Luntian Log Cabin. All rights reserved. | Tagaytay's Hidden Gem for Rest & Wellness</p>
            </div>
        </div>
    </footer>

    <!-- Booking Modal -->
    <div id="bookingModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">🏨 Book Your Stay at Luntian</h2>
                <button class="close-modal" onclick="closeBookingModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="bookingForm">
                    <div class="form-group">
                        <label>Guest Name</label>
                        <input type="text" id="guestName" required placeholder="Primary guest full name">
                    </div>
                    
                    <div class="form-group">
                        <label>Contact Number</label>
                        <input type="tel" id="guestPhone" required placeholder="09XXXXXXXXX">
                    </div>
                    
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="guestEmail" required placeholder="guest@example.com">
                    </div>
                    
                    <div class="date-row">
                        <div class="form-group">
                            <label>Check-in Date</label>
                            <input type="date" id="checkinDate" required>
                        </div>
                        <div class="form-group">
                            <label>Check-out Date</label>
                            <input type="date" id="checkoutDate" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Room Preference</label>
                        <select id="roomType" required>
                            <option value="">Select room...</option>
                            <option value="Room 1">Luntian Room 1 (2 guests) - Airbnb</option>
                            <option value="Room 2">Luntian Room 2 (up to 4 guests) - Airbnb</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Number of Guests</label>
                        <select id="guestCount" required>
                            <option value="">Select...</option>
                            <option value="1">1 Guest</option>
                            <option value="2">2 Guests</option>
                            <option value="3">3 Guests</option>
                            <option value="4">4 Guests</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Bringing Pets?</label>
                        <select id="pets">
                            <option value="No">No pets</option>
                            <option value="1 pet">1 small pet</option>
                            <option value="2 pets">2 small pets (max)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Rate Preference</label>
                        <select id="rateType">
                            <option value="">Select...</option>
                            <option value="weeknight">🔥 PROMO: Weeknight Rate (Was ₱4,500 NOW ₱1,999)</option>
                            <option value="weekend-breakfast">🌟 PROMO: Weekend with Breakfast (Was ₱7,000 NOW ₱2,499)</option>
                            <option value="platform">Book via Airbnb/Booking.com/Agoda</option>
                            <option value="custom">Custom Quote</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Special Requests</label>
                        <textarea id="specialRequests" rows="3" placeholder="Any special accommodations, dietary restrictions, celebration requests, or questions about room availability..."></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%;">📝 Submit Booking Request</button>
                </form>
                
                <div id="bookingResult"></div>
            </div>
        </div>
    </div>

    <script>
        // Close promo banner
        function closePromoBanner() {
            document.getElementById('promoBanner').style.display = 'none';
            document.getElementById('navbar').style.marginTop = '0';
            document.querySelector('.hero').style.marginTop = '0';
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', function() {
            const navbar = document.getElementById('navbar');
            const promoBanner = document.getElementById('promoBanner');
            
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
                if (promoBanner.style.display !== 'none') {
                    navbar.style.marginTop = '45px';
                } else {
                    navbar.style.marginTop = '0';
                }
            } else {
                navbar.classList.remove('scrolled');
                if (promoBanner.style.display !== 'none') {
                    navbar.style.marginTop = '45px';
                } else {
                    navbar.style.marginTop = '0';
                }
            }
        });

        // Fade in animation on scroll
        function checkFadeIn() {
            const elements = document.querySelectorAll('.fade-in');
            
            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < window.innerHeight - elementVisible) {
                    element.classList.add('visible');
                }
            });
        }

        window.addEventListener('scroll', checkFadeIn);
        checkFadeIn(); // Check on load

        // Mobile menu toggle
        function toggleMobileMenu() {
            const navLinks = document.querySelector('.nav-links');
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        }

        // Booking modal functions
        function openBookingModal(roomType = '') {
            const modal = document.getElementById('bookingModal');
            const roomSelect = document.getElementById('roomType');
            
            if (roomType) {
                roomSelect.value = roomType;
            }
            
            // Set minimum dates to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('checkinDate').min = today;
            document.getElementById('checkoutDate').min = today;
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        function closeBookingModal() {
            const modal = document.getElementById('bookingModal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Reset form
            document.getElementById('bookingForm').reset();
            document.getElementById('bookingResult').innerHTML = '';
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('bookingModal');
            if (event.target === modal) {
                closeBookingModal();
            }
        }

        // Date validation for booking
        document.getElementById('checkinDate').addEventListener('change', function() {
            const checkinDate = this.value;
            const checkoutInput = document.getElementById('checkoutDate');
            checkoutInput.min = checkinDate;
            
            // Clear checkout if it's before new checkin
            if (checkoutInput.value && checkoutInput.value <= checkinDate) {
                checkoutInput.value = '';
            }
        });

        // Form submissions
        document.getElementById('bookingForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const checkinDate = document.getElementById('checkinDate').value;
            const checkoutDate = document.getElementById('checkoutDate').value;
            
            if (checkoutDate <= checkinDate) {
                document.getElementById('bookingResult').innerHTML = 
                    '<div class="error-message">❌ Check-out date must be after check-in date!</div>';
                return;
            }
            
            const bookingData = {
                guestName: document.getElementById('guestName').value,
                guestPhone: document.getElementById('guestPhone').value,
                guestEmail: document.getElementById('guestEmail').value,
                checkinDate: checkinDate,
                checkoutDate: checkoutDate,
                roomType: document.getElementById('roomType').value,
                guestCount: document.getElementById('guestCount').value,
                pets: document.getElementById('pets').value,
                rateType: document.getElementById('rateType').value,
                specialRequests: document.getElementById('specialRequests').value
            };
            
            // Simulate booking submission
            document.getElementById('bookingResult').innerHTML = 
                '<div class="success-message">✅ Booking request submitted! We\'ll contact you within 24 hours to confirm availability and payment details. Thank you for choosing Luntian Log Cabin - Tagaytay\'s hidden gem!</div>';
            
            // In real implementation, this would connect to your Google Apps Script backend
            console.log('Booking submitted:', bookingData);
        });

        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const contactData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                phone: document.getElementById('contactPhone').value,
                inquiryType: document.getElementById('inquiryType').value,
                message: document.getElementById('contactMessage').value
            };
            
            // Simulate form submission
            alert('Thank you for your inquiry! We\'ll get back to you soon.');
            this.reset();
            
            // In real implementation, this would connect to your backend
            console.log('Contact form submitted:', contactData);
        });

        // Gallery image modal (placeholder)
        function openImageModal(imageName) {
            alert(`View ${imageName} - In the full implementation, this would open a beautiful image gallery modal.`);
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            checkFadeIn();
        });
    </script>
</body>
</html>
