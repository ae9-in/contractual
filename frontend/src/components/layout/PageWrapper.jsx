import { motion } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 }
};

const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
};

export default function PageWrapper({ children }) {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            style={{ width: '100%' }}
        >
            {children}
        </motion.div>
    );
}
