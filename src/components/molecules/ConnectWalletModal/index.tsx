import Modal from '@/components/atoms/Modal';
import { ReactNode } from 'react';

type ConnectWalletModalProps = {
    trigger: ReactNode;
};

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ trigger }) => {
    return <Modal trigger={trigger}>lol</Modal>;
};

export default ConnectWalletModal;
