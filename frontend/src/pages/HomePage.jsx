import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  Target,
  ArrowRight,
  CheckCircle,
  Code,
  Lock,
  Globe,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const orbVariants = {
    animate: {
      y: [0, -20, 0],
      transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const processSteps = [
    {
      title: "Define Project",
      desc: "Architect your requirements with precision-guided templates and smart estimation.",
      icon: <Code size={24} />
    },
    {
      title: "Smart Matching",
      desc: "Our neural engine identifies the top 3% of vetted talent tailored to your stack.",
      icon: <Target size={24} />
    },
    {
      title: "Secure Milestone",
      desc: "Funds are held in secure escrow and released only upon your verified approval.",
      icon: <Shield size={24} />
    },
    {
      title: "Global Delivery",
      desc: "Streamlined collaboration tools ensure world-class delivery from anywhere.",
      icon: <Globe size={24} />
    }
  ];

  const sampleProjects = [
    { title: "React Financial Architecture", budget: "INR 85,000", tag: "Enterprise", delay: 0.1 },
    { title: "Node.js Scale Optimization", budget: "INR 1,20,000", tag: "System Design", delay: 0.2 },
    { title: "UI/UX Strategic Overhaul", budget: "INR 55,000", tag: "Creative", delay: 0.3 }
  ];

  return (
    <div className="landing-premium-complete mesh-gradient-wrap">
      <div className="mesh-gradient-bg" />
      <div className="pattern-grid-premium" />
      {/* Hero Section */}
      <section className="hero-premium-light">
        <div className="hero-bg-graphic">
          <motion.div
            variants={orbVariants}
            animate="animate"
            className="orb"
            style={{ width: '600px', height: '600px', background: 'rgba(79, 70, 229, 0.1)', top: '-150px', right: '10%', position: 'absolute', borderRadius: '999px', filter: 'blur(100px)' }}
          />
          <motion.div
            variants={orbVariants}
            animate="animate"
            className="orb"
            style={{ width: '500px', height: '500px', background: 'rgba(124, 58, 237, 0.08)', bottom: '-100px', left: '5%', position: 'absolute', borderRadius: '999px', filter: 'blur(100px)' }}
          />
          <div className="bg-noise" />
        </div>

        <motion.div
          className="container hero-layout-premium"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ position: 'relative', zIndex: 2 }}
        >
          <div className="hero-content-main">
            <motion.div variants={itemVariants} className="badge-premium" style={{ background: 'rgba(79, 70, 229, 0.08)', borderColor: 'rgba(79, 70, 229, 0.2)', color: '#4f46e5' }}>
              <Award size={14} /> Recognized as #1 for Secure Freelancing
            </motion.div>

            <motion.h1 variants={itemVariants} className="hero-title-mega">
              Simple Contracts. <br />
              <span className="text-gradient-premium">Real Results.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="hero-subtitle-refined" style={{ color: '#475569' }}>
              The premier platform connecting forward-thinking businesses with world-class freelance talent.
              Guaranteed delivery meets complete security and transparent growth.
            </motion.p>

            <motion.div variants={itemVariants} className="hero-action-group">
              <Button to="/register" variant="primary" className="btn-lg-premium">
                Hire Elite Talent <ArrowRight size={18} />
              </Button>
              <Button to="/login" variant="secondary" className="btn-lg-premium">
                Find High-Value Work
              </Button>
            </motion.div>

                        <motion.div variants={itemVariants} className="hero-stats-row">
              {[
                { value: '120+', label: 'Live Missions' },
                { value: '48h', label: 'Average Kickoff' },
                { value: '24/7', label: 'Global Momentum' },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  className="stat-pill"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: [0, -4, 0] }}
                  transition={{
                    opacity: { delay: 0.25 + idx * 0.1, duration: 0.4 },
                    y: { delay: 0.5 + idx * 0.15, duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid var(--blue-light)', color: '#0f172a' }}
                >
                  <strong style={{ color: '#000' }}>{stat.value}</strong> {stat.label}
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="hero-media-wrapper"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="premium-app-mockup" style={{ background: '#fff', border: '8px solid var(--blue-light)', boxShadow: '0 40px 80px rgba(59, 130, 246, 0.15)' }}>
              <div className="mockup-header" style={{ background: 'var(--blue-light)' }}>
                <div className="mockup-dot" style={{ background: 'rgba(59, 130, 246, 0.2)' }} /><div className="mockup-dot" style={{ background: 'rgba(59, 130, 246, 0.2)' }} /><div className="mockup-dot" style={{ background: 'rgba(59, 130, 246, 0.2)' }} />
              </div>
              <div className="mockup-body">
                <div className="mockup-sidebar" style={{ background: '#f8fbff', borderColor: 'var(--blue-light)' }} />
                <div className="mockup-content">
                  <div className="mockup-chart" style={{ background: 'linear-gradient(0deg, var(--soft-glow), transparent)', borderBottom: '3px solid var(--vibrant-blue)' }} />
                  <div className="mockup-cards">
                    <div className="m-card" style={{ background: '#f8fbff', border: '1px solid var(--blue-light)' }} /><div className="m-card" style={{ background: '#f8fbff', border: '1px solid var(--blue-light)' }} />
                  </div>
                </div>
              </div>
              <motion.div
                className="floating-security-badge"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)' }}
              >
                <div className="secure-icon" style={{ background: 'rgba(255,255,255,0.2)' }}><Shield size={16} fill="#fff" /></div>
                <div>
                  <div className="secure-label" style={{ color: 'rgba(255,255,255,0.9)' }}>ESCROW PROTECTED</div>
                  <div className="secure-val">INR 42,500 SECURED</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section - workflow */}
      <section className="about-workflow-section" style={{ background: 'transparent' }}>
        <div className="container">
          <motion.div
            className="header-block-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title-refined">How Contractual Works</h2>
            <p className="section-desc-refined">A comprehensive, end-to-end ecosystem built for professional transparency.</p>
          </motion.div>

          <div className="workflow-steps-layout">
            {processSteps.map((step, i) => (
              <motion.div
                key={i}
                className="step-card-premium"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                style={{ background: 'rgba(255,255,255,0.96)', borderColor: '#dbe3f3', boxShadow: '0 16px 34px rgba(59,130,246,0.10)' }}
              >
                <div className="step-count" style={{ color: 'rgba(79, 70, 229, 0.05)' }}>{i + 1}</div>
                <div className="step-icon-glow" style={{ color: '#4f46e5', background: '#fff' }}>{step.icon}</div>
                <h4 style={{ color: '#0f172a' }}>{step.title}</h4>
                <p style={{ color: '#64748b' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Discovery Teaser Section */}
      <section className="discovery-teaser-section" style={{ background: 'transparent' }}>
        <div className="container">
          <div className="discovery-layout">
            <motion.div
              className="discovery-text"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="side-title-premium text-gradient-premium">Premium <br /> Opportunities</h2>
              <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Explore high-value projects curated for elite specialists. Secure and verified only.</p>
              <Button to="/freelancer/projects" variant="secondary" className="discover-btn">View All Projects</Button>
            </motion.div>

            <div className="discovery-projects-stack">
              {sampleProjects.map((p, i) => (
                <motion.div
                  key={i}
                  className="preview-project-card"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: p.delay }}
                  whileHover={{ x: 10, backgroundColor: '#fff', borderColor: '#818cf8', boxShadow: '0 20px 40px rgba(79, 70, 229, 0.08)' }}
                  style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid #d8e2fb', boxShadow: '0 16px 32px rgba(79,70,229,0.10)' }}
                >
                  <div className="p-card-top">
                    <span className="p-tag" style={{ background: 'var(--blue-light)', color: 'var(--vibrant-blue)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>{p.tag}</span>
                    <strong className="p-budget" style={{ color: '#059669' }}>{p.budget}</strong>
                  </div>
                  <h4 style={{ color: '#0f172a' }}>{p.title}</h4>
                  <div className="p-card-footer" style={{ color: '#64748b' }}>
                    <span>Verified Client</span> <TrendingUp size={14} style={{ color: 'var(--vibrant-blue)' }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section className="capabilities-section" style={{ background: 'transparent' }}>
        <div className="container">
          <div className="cap-grid">
            <motion.div className="cap-card" whileHover={{ y: -10 }} style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #dbe3f3', boxShadow: '0 16px 30px rgba(59,130,246,0.10)' }}>
              <Zap size={32} className="cap-icon" />
              <h3>Instant Matching</h3>
              <p>Skip the bidding wars. Our engine connects you with the right fit instantly.</p>
            </motion.div>
            <motion.div className="cap-card" whileHover={{ y: -10 }} style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #dbe3f3', boxShadow: '0 16px 30px rgba(59,130,246,0.10)' }}>
              <TrendingUp size={32} className="cap-icon" />
              <h3>Milestone Growth</h3>
              <p>Build your reputation with verified milestone completions and feedback.</p>
            </motion.div>
            <motion.div className="cap-card" whileHover={{ y: -10 }} style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #dbe3f3', boxShadow: '0 16px 30px rgba(59,130,246,0.10)' }}>
              <Lock size={32} className="cap-icon" />
              <h3>Encrypted IP</h3>
              <p>Your data and intellectual property are protected by industry-standard protocols.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="sticky-cta-footer">
        <div className="container">
          <Card className="ultimate-cta-card">
            <div className="cta-grid" style={{ alignItems: 'center' }}>
              <div className="cta-msg">
                <h2>Scaling Talent? <br /> Building a Product?</h2>
                <p>Contractual provides the infrastructure for high-growth success.</p>
              </div>
              <div className="cta-btns-final">
                <Button to="/register" variant="primary" className="btn-final-primary">Get Started in Seconds</Button>
                <div className="cta-guarantee"><CheckCircle size={14} /> No setup fees. Secure Escrow.</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

    </div>
  );
}



