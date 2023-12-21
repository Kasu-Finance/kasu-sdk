'use client';

import Typography from '@/components/atoms/Typography';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavigationProps = {
    links: {
        to: string;
        label: string;
    }[];
};

const Navigation: React.FC<NavigationProps> = ({ links }) => {
    const pathName = usePathname();

    return (
        <NavigationMenu.Root className='nav-menu'>
            <NavigationMenu.List className='nav-list'>
                {links.map(({ to, label }, index) => (
                    <NavigationMenu.Item key={index}>
                        <NavigationMenu.Link active={pathName === to} asChild>
                            <Link href={to}>
                                <Typography variant='span'>{label}</Typography>
                            </Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                ))}
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
};

export default Navigation;
