"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleVisibility = () => {
      setIsVisible(true);
    };

    window.addEventListener("scroll", handleScroll);
    setTimeout(handleVisibility, 100);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: "📊",
      title: "Tracking Progress",
      description: "Pantau perkembangan fitness Anda dengan grafik dan statistik yang detail",
    },
    {
      icon: "💪",
      title: "Workout Plans",
      description: "Rencana latihan personalized sesuai dengan tujuan dan level Anda",
    },
    {
      icon: "🍎",
      title: "Nutrition Guide",
      description: "Panduan nutrisi untuk mendukung program fitness Anda",
    },
    {
      icon: "👥",
      title: "Community Support",
      description: "Bergabung dengan komunitas fitness yang saling mendukung",
    },
    {
      icon: "📱",
      title: "Mobile Friendly",
      description: "Akses dari mana saja dengan desain yang responsive",
    },
    {
      icon: "🎯",
      title: "Goal Setting",
      description: "Tetapkan dan capai target fitness Anda dengan sistem reminder",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Fitness Enthusiast",
      content: "SimpleFit membantu saya menurunkan 10kg dalam 3 bulan! Interface yang mudah dipahami.",
      avatar: "👩",
    },
    {
      name: "Mike Chen",
      role: "Personal Trainer",
      content: "Platform yang bagus untuk klien saya. Tracking progress sangat membantu.",
      avatar: "👨",
    },
    {
      name: "Lisa Wang",
      role: "Yoga Instructor",
      content: "Nutrition guide-nya sangat detail dan mudah diikuti untuk pemula.",
      avatar: "🧘",
    },
  ];

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav
        style={{
          ...styles.nav,
          ...(isScrolled ? styles.navScrolled : {}),
          transform: isVisible ? "translateY(0)" : "translateY(-100%)",
          opacity: isVisible ? 1 : 0,
        }}
      >
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <div style={styles.logoImageContainer}>
              <img
                src="/logo1.png"
                alt="SimpleFit Logo"
                style={styles.logoImage}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <span style={styles.logoText}>SimpleFit</span>
          </div>
          <div style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>
              Fitur
            </a>
            <a href="#testimonials" style={styles.navLink}>
              Testimoni
            </a>
            <a href="#pricing" style={styles.navLink}>
              Harga
            </a>
            <Link href="/login" style={styles.navLink}>
              Masuk
            </Link>
            <Link href="/register" style={styles.ctaButton}>
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" style={styles.hero}>
        <div style={styles.heroContent}>
          <div
            style={{
              ...styles.heroText,
              transform: isVisible ? "translateY(0)" : "translateY(30px)",
              opacity: isVisible ? 1 : 0,
            }}
          >
            <h1 style={styles.heroTitle}>
              Transformasi Tubuh Anda
              <span style={styles.gradientText}> Dengan SimpleFit</span>
            </h1>
            <p style={styles.heroDescription}>Platform fitness all-in-one untuk membantu Anda mencapai tujuan kebugaran. Dari tracking workout hingga panduan nutrisi, semua dalam satu aplikasi.</p>
            <div style={styles.heroButtons}>
              <Link href="/register" style={styles.primaryButton}>
                Mulai Sekarang
              </Link>
              <a href="#features" style={styles.secondaryButton}>
                Pelajari Lebih Lanjut
              </a>
            </div>
            <div style={styles.stats}>
              <div style={styles.stat}>
                <div style={styles.statNumber}>10K+</div>
                <div style={styles.statLabel}>Pengguna Aktif</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statNumber}>50+</div>
                <div style={styles.statLabel}>Program Workout</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statNumber}>98%</div>
                <div style={styles.statLabel}>Kepuasan Pengguna</div>
              </div>
            </div>
          </div>
          <div
            style={{
              ...styles.heroImage,
              transform: isVisible ? "translateY(0)" : "translateY(30px)",
              opacity: isVisible ? 1 : 0,
            }}
          >
            <div style={styles.imagePlaceholder}>
              <div style={styles.floatingCard}>
                <div style={styles.cardIcon}>🏃</div>
                <div style={styles.cardText}>
                  <div style={styles.cardTitle}>Workout Completed</div>
                  <div style={styles.cardSubtitle}>45 minutes • 320 kcal</div>
                </div>
              </div>
              <div style={styles.floatingCard2}>
                <div style={styles.cardIcon}>📈</div>
                <div style={styles.cardText}>
                  <div style={styles.cardTitle}>Progress +15%</div>
                  <div style={styles.cardSubtitle}>This week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={styles.scrollIndicator}>
          <div style={styles.scrollArrow}></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionContent}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Fitur Unggulan</h2>
            <p style={styles.sectionSubtitle}>Everything you need to achieve your fitness goals</p>
          </div>
          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  ...styles.featureCard,
                  animationDelay: `${index * 0.1}s`,
                }}
                className="feature-card"
              >
                <div style={styles.featureIcon}>{feature.icon}</div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" style={styles.testimonialsSection}>
        <div style={styles.sectionContent}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Apa Kata Mereka</h2>
            <p style={styles.sectionSubtitle}>Cerita sukses dari komunitas SimpleFit</p>
          </div>
          <div style={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                style={{
                  ...styles.testimonialCard,
                  animationDelay: `${index * 0.2}s`,
                }}
                className="testimonial-card"
              >
                <div style={styles.testimonialContent}>"{testimonial.content}"</div>
                <div style={styles.testimonialAuthor}>
                  <div style={styles.testimonialAvatar}>{testimonial.avatar}</div>
                  <div style={styles.testimonialInfo}>
                    <div style={styles.testimonialName}>{testimonial.name}</div>
                    <div style={styles.testimonialRole}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={styles.section}>
        <div style={styles.sectionContent}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Pilih Plan Anda</h2>
            <p style={styles.sectionSubtitle}>Mulai perjalanan fitness Anda hari ini</p>
          </div>
          <div style={styles.pricingGrid}>
            <div style={styles.pricingCard} className="pricing-card">
              <div style={styles.pricingHeader}>
                <h3 style={styles.pricingTitle}>Basic</h3>
                <div style={styles.pricingPrice}>
                  <span style={styles.price}>Gratis</span>
                </div>
              </div>
              <ul style={styles.pricingFeatures}>
                <li style={styles.pricingFeature}>✓ Workout Tracking</li>
                <li style={styles.pricingFeature}>✓ Basic Nutrition Guide</li>
                <li style={styles.pricingFeature}>✓ Community Access</li>
                <li style={styles.pricingFeature}>✗ Personalized Plans</li>
                <li style={styles.pricingFeature}>✗ Advanced Analytics</li>
              </ul>
              <Link href="/register" style={styles.pricingButton}>
                Mulai Gratis
              </Link>
            </div>

            <div style={styles.pricingCardFeatured} className="pricing-card-featured">
              <div style={styles.featuredBadge}>POPULER</div>
              <div style={styles.pricingHeader}>
                <h3 style={styles.pricingTitle}>Pro</h3>
                <div style={styles.pricingPrice}>
                  <span style={styles.price}>Rp 99.000</span>
                  <span style={styles.pricePeriod}>/bulan</span>
                </div>
              </div>
              <ul style={styles.pricingFeatures}>
                <li style={styles.pricingFeature}>✓ Semua Fitur Basic</li>
                <li style={styles.pricingFeature}>✓ Personalized Workout Plans</li>
                <li style={styles.pricingFeature}>✓ Advanced Nutrition Guide</li>
                <li style={styles.pricingFeature}>✓ Progress Analytics</li>
                <li style={styles.pricingFeature}>✓ Priority Support</li>
              </ul>
              <Link href="/register" style={styles.pricingButtonFeatured}>
                Daftar Sekarang
              </Link>
            </div>

            <div style={styles.pricingCard} className="pricing-card">
              <div style={styles.pricingHeader}>
                <h3 style={styles.pricingTitle}>Premium</h3>
                <div style={styles.pricingPrice}>
                  <span style={styles.price}>Rp 199.000</span>
                  <span style={styles.pricePeriod}>/bulan</span>
                </div>
              </div>
              <ul style={styles.pricingFeatures}>
                <li style={styles.pricingFeature}>✓ Semua Fitur Pro</li>
                <li style={styles.pricingFeature}>✓ 1-on-1 Coaching Sessions</li>
                <li style={styles.pricingFeature}>✓ Custom Meal Plans</li>
                <li style={styles.pricingFeature}>✓ Video Call Support</li>
                <li style={styles.pricingFeature}>✓ Early Feature Access</li>
              </ul>
              <Link href="/register" style={styles.pricingButton}>
                Pilih Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Siap Transformasi Tubuh Anda?</h2>
          <p style={styles.ctaDescription}>Bergabung dengan ribuan orang yang sudah merasakan manfaat SimpleFit</p>
          <div style={styles.ctaButtons}>
            <Link href="/register" style={styles.primaryButtonLarge}>
              Daftar Sekarang - Gratis
            </Link>
            <Link href="/login" style={styles.secondaryButtonLarge}>
              Masuk Akun
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerMain}>
            <div style={styles.footerBrand}>
              <div style={styles.logo}>
                <div style={styles.logoImageContainer}>
                  <img
                    src="/logo1.png"
                    alt="SimpleFit Logo"
                    style={styles.logoImage}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <span style={styles.logoText}>SimpleFit</span>
              </div>
              <p style={styles.footerDescription}>Platform fitness terdepan untuk membantu Anda mencapai tujuan kebugaran dengan cara yang menyenangkan dan efektif.</p>
            </div>
            <div style={styles.footerLinks}>
              <div style={styles.footerColumn}>
                <h4 style={styles.footerTitle}>Product</h4>
                <a href="#features" style={styles.footerLink}>
                  Fitur
                </a>
                <a href="#pricing" style={styles.footerLink}>
                  Harga
                </a>
                <a href="#testimonials" style={styles.footerLink}>
                  Testimoni
                </a>
              </div>
              <div style={styles.footerColumn}>
                <h4 style={styles.footerTitle}>Company</h4>
                <a href="#" style={styles.footerLink}>
                  Tentang Kami
                </a>
                <a href="#" style={styles.footerLink}>
                  Blog
                </a>
                <a href="#" style={styles.footerLink}>
                  Karir
                </a>
              </div>
              <div style={styles.footerColumn}>
                <h4 style={styles.footerTitle}>Support</h4>
                <a href="#" style={styles.footerLink}>
                  Bantuan
                </a>
                <a href="#" style={styles.footerLink}>
                  Kontak
                </a>
                <a href="#" style={styles.footerLink}>
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
          <div style={styles.footerBottom}>
            <div style={styles.copyright}>© 2024 SimpleFit. All rights reserved.</div>
            <div style={styles.socialLinks}>
              <a href="#" style={styles.socialLink}>
                Twitter
              </a>
              <a href="#" style={styles.socialLink}>
                Facebook
              </a>
              <a href="#" style={styles.socialLink}>
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    lineHeight: 1.6,
    margin: 0,
    padding: 0,
    overflowX: "hidden",
  },
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    padding: "1rem 0",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
    zIndex: 1000,
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  navScrolled: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    padding: "0.75rem 0",
  },
  navContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "1.5rem",
    fontWeight: "700",
  },
  logoImageContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    objectFit: "contain",
  },
  logoText: {
    background: "linear-gradient(135deg, #70c1b3 0%, #247ba0 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
  },
  navLink: {
    color: "#374151",
    textDecoration: "none",
    fontWeight: "500",
    transition: "all 0.3s ease",
    position: "relative",
  },
  ctaButton: {
    backgroundColor: "#247ba0",
    color: "white",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
    transition: "all 0.3s ease",
    transform: "translateY(0)",
  },
  hero: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #a8e6cf 0%, #70c1b3 50%, #247ba0 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: "80px 2rem 2rem 2rem",
    margin: 0,
    overflow: "hidden",
  },
  heroContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "4rem",
    alignItems: "center",
    width: "100%",
  },
  heroText: {
    color: "white",
    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  heroTitle: {
    fontSize: "3.5rem",
    fontWeight: "700",
    lineHeight: 1.1,
    marginBottom: "1.5rem",
    marginTop: 0,
  },
  gradientText: {
    background: "linear-gradient(135deg, #fff 0%, #e0f7fa 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "block",
  },
  heroDescription: {
    fontSize: "1.25rem",
    marginBottom: "2rem",
    opacity: 0.9,
    lineHeight: 1.6,
  },
  heroButtons: {
    display: "flex",
    gap: "1rem",
    marginBottom: "3rem",
  },
  primaryButton: {
    backgroundColor: "white",
    color: "#247ba0",
    padding: "1rem 2rem",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "1.1rem",
    transition: "all 0.3s ease",
    display: "inline-block",
    transform: "translateY(0)",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    color: "white",
    padding: "1rem 2rem",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "1.1rem",
    border: "2px solid white",
    transition: "all 0.3s ease",
    display: "inline-block",
    transform: "translateY(0)",
  },
  stats: {
    display: "flex",
    gap: "3rem",
  },
  stat: {
    textAlign: "center",
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "0.5rem",
  },
  statLabel: {
    fontSize: "0.9rem",
    opacity: 0.8,
  },
  heroImage: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s",
  },
  imagePlaceholder: {
    width: "100%",
    height: "400px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    position: "relative",
  },
  floatingCard: {
    position: "absolute",
    top: "20%",
    left: "-10%",
    backgroundColor: "white",
    padding: "1rem",
    borderRadius: "12px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    minWidth: "200px",
    animation: "float 6s ease-in-out infinite",
  },
  floatingCard2: {
    position: "absolute",
    bottom: "20%",
    right: "-10%",
    backgroundColor: "white",
    padding: "1rem",
    borderRadius: "12px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    minWidth: "200px",
    animation: "float 6s ease-in-out infinite 2s",
  },
  cardIcon: {
    fontSize: "2rem",
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: "600",
    color: "#1f2937",
  },
  cardSubtitle: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  scrollIndicator: {
    position: "absolute",
    bottom: "2rem",
    left: "50%",
    transform: "translateX(-50%)",
  },
  scrollArrow: {
    width: "2rem",
    height: "2rem",
    borderRight: "2px solid white",
    borderBottom: "2px solid white",
    transform: "rotate(45deg)",
    animation: "bounce 2s infinite",
  },
  section: {
    padding: "6rem 2rem",
    backgroundColor: "white",
    margin: 0,
  },
  testimonialsSection: {
    padding: "6rem 2rem",
    backgroundColor: "#f8fafc",
    margin: 0,
  },
  sectionContent: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "4rem",
  },
  sectionTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "1rem",
  },
  sectionSubtitle: {
    fontSize: "1.25rem",
    color: "#6b7280",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
  },
  featureCard: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
    transition: "all 0.3s ease",
    opacity: 0,
    transform: "translateY(30px)",
    animation: "fadeInUp 0.6s ease forwards",
  },
  featureIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
    transition: "transform 0.3s ease",
  },
  featureTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "1rem",
  },
  featureDescription: {
    color: "#6b7280",
    lineHeight: 1.6,
  },
  testimonialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
  },
  testimonialCard: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
    opacity: 0,
    transform: "translateY(30px)",
    animation: "fadeInUp 0.6s ease forwards",
  },
  testimonialContent: {
    fontSize: "1.125rem",
    color: "#374151",
    fontStyle: "italic",
    marginBottom: "2rem",
    lineHeight: 1.6,
  },
  testimonialAuthor: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  testimonialAvatar: {
    fontSize: "2rem",
  },
  testimonialName: {
    fontWeight: "600",
    color: "#1f2937",
  },
  testimonialRole: {
    color: "#6b7280",
    fontSize: "0.875rem",
  },
  pricingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  pricingCard: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
    position: "relative",
    transition: "all 0.3s ease",
    opacity: 0,
    transform: "translateY(30px)",
    animation: "fadeInUp 0.6s ease forwards",
  },
  pricingCardFeatured: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(36, 123, 160, 0.15)",
    textAlign: "center",
    position: "relative",
    border: "2px solid #247ba0",
    transform: "scale(1.05)",
    transition: "all 0.3s ease",
    opacity: 0,
    animation: "fadeInUp 0.6s ease forwards 0.3s",
  },
  featuredBadge: {
    position: "absolute",
    top: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#247ba0",
    color: "white",
    padding: "0.5rem 1.5rem",
    borderRadius: "20px",
    fontSize: "0.875rem",
    fontWeight: "600",
  },
  pricingHeader: {
    marginBottom: "2rem",
  },
  pricingTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "1rem",
  },
  pricingPrice: {
    marginBottom: "1rem",
  },
  price: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#247ba0",
  },
  pricePeriod: {
    color: "#6b7280",
    fontSize: "1rem",
  },
  pricingFeatures: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 2rem 0",
  },
  pricingFeature: {
    padding: "0.5rem 0",
    color: "#374151",
  },
  pricingButton: {
    display: "block",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    padding: "1rem 2rem",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  pricingButtonFeatured: {
    display: "block",
    backgroundColor: "#247ba0",
    color: "white",
    padding: "1rem 2rem",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  ctaSection: {
    padding: "6rem 2rem",
    background: "linear-gradient(135deg, #a8e6cf 0%, #70c1b3 50%, #247ba0 100%)",
    textAlign: "center",
    color: "white",
    margin: 0,
  },
  ctaContent: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  ctaTitle: {
    fontSize: "3rem",
    fontWeight: "700",
    marginBottom: "1.5rem",
  },
  ctaDescription: {
    fontSize: "1.25rem",
    marginBottom: "3rem",
    opacity: 0.9,
  },
  ctaButtons: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryButtonLarge: {
    backgroundColor: "white",
    color: "#247ba0",
    padding: "1.25rem 2.5rem",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "1.1rem",
    transition: "all 0.3s ease",
    transform: "translateY(0)",
  },
  secondaryButtonLarge: {
    backgroundColor: "transparent",
    color: "white",
    padding: "1.25rem 2.5rem",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "1.1rem",
    border: "2px solid white",
    transition: "all 0.3s ease",
    transform: "translateY(0)",
  },
  footer: {
    backgroundColor: "#1f2937",
    color: "white",
    padding: "4rem 2rem 2rem",
    margin: 0,
  },
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  footerMain: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "4rem",
    marginBottom: "3rem",
  },
  footerBrand: {
    maxWidth: "300px",
  },
  footerDescription: {
    color: "#d1d5db",
    marginTop: "1rem",
    lineHeight: 1.6,
  },
  footerLinks: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "2rem",
  },
  footerColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  footerTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    marginBottom: "1rem",
  },
  footerLink: {
    color: "#d1d5db",
    textDecoration: "none",
    transition: "all 0.3s ease",
  },
  footerBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "2rem",
    borderTop: "1px solid #374151",
  },
  copyright: {
    color: "#9ca3af",
  },
  socialLinks: {
    display: "flex",
    gap: "1.5rem",
  },
  socialLink: {
    color: "#d1d5db",
    textDecoration: "none",
    transition: "all 0.3s ease",
  },
};

const stylesheet = `
  @keyframes float {
    0%, 100% { 
      transform: translateY(0px) rotate(0deg); 
    }
    50% { 
      transform: translateY(-20px) rotate(5deg); 
    }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { 
      transform: translateY(0) rotate(45deg); 
    }
    40% { 
      transform: translateY(-10px) rotate(45deg); 
    }
    60% { 
      transform: translateY(-5px) rotate(45deg); 
    }
  }

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

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  * {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  .feature-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }

  .feature-card:hover .feature-icon {
    transform: scale(1.2) rotate(5deg);
  }

  .primary-button:hover, .primary-button-large:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(255, 255, 255, 0.4);
  }

  .secondary-button:hover, .secondary-button-large:hover {
    background-color: white;
    color: #247ba0;
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(255, 255, 255, 0.2);
  }

  .pricing-button:hover {
    background-color: #247ba0;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(36, 123, 160, 0.3);
  }

  .pricing-button-featured:hover {
    background-color: #1a5a7a;
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(36, 123, 160, 0.4);
  }

  .pricing-card-featured:hover {
    transform: scale(1.08);
    box-shadow: 0 20px 50px rgba(36, 123, 160, 0.25);
  }

  .pricing-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  }

  .testimonial-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  }

  .nav-link:hover {
    color: #70c1b3;
    transform: translateY(-2px);
  }

  .nav-link:hover::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(135deg, #70c1b3 0%, #247ba0 100%);
    animation: slideInLeft 0.3s ease;
  }

  .footer-link:hover, .social-link:hover {
    color: #70c1b3;
    transform: translateX(5px);
  }

  .cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(255, 255, 255, 0.3);
  }

  input:focus {
    outline: none;
    border-color: #70c1b3 !important;
    box-shadow: 0 0 0 3px rgba(112, 193, 179, 0.1);
    transform: scale(1.02);
  }

  .feature-card, .testimonial-card, .pricing-card {
    animation-fill-mode: both;
  }

  .cta-section {
    background: linear-gradient(-45deg, #a8e6cf, #70c1b3, #247ba0, #1a5a7a);
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .stat-number {
    animation: countUp 2s ease-out;
  }

  @keyframes countUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = stylesheet;
  document.head.appendChild(styleSheet);
}
