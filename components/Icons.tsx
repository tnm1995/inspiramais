
import React from 'react';

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
    iconName: string;
    filled?: boolean;
}

const Icon: React.FC<IconProps> = ({ iconName, className = '', filled = false, style, ...props }) => {
    const combinedStyle: React.CSSProperties = {
        ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}),
        width: '1em',
        height: '1em',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        ...style
    };

    return (
        <span
            className={`material-symbols-outlined leading-none select-none ${className}`}
            style={combinedStyle}
            {...props}
        >
            {iconName}
        </span>
    );
};

export const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

export const LockIcon = (props: any) => <Icon iconName="lock" {...props} />;
export const BellIcon = (props: any) => <Icon iconName="notifications" {...props} />;
export const NotificationsIcon = (props: any) => <Icon iconName="notifications" {...props} />;
export const CrownIcon = (props: any) => <Icon iconName="workspace_premium" filled {...props} />;
export const ShareIcon = (props: any) => <Icon iconName="share" {...props} />;
export const UserCircleIcon = (props: any) => <Icon iconName="account_circle" {...props} />;
export const ChevronLeftIcon = (props: any) => <Icon iconName="arrow_back_ios_new" {...props} />;
export const ChevronRightIcon = (props: any) => <Icon iconName="arrow_forward_ios" {...props} />;
export const ChevronDownIcon = (props: any) => <Icon iconName="keyboard_arrow_down" {...props} />;
export const CreditCardIcon = (props: any) => <Icon iconName="credit_card" {...props} />;
export const CogIcon = (props: any) => <Icon iconName="settings" {...props} />;
export const UserIcon = (props: any) => <Icon iconName="account_circle" filled {...props} />;
export const CheckIcon = (props: any) => <Icon iconName="check" {...props} />;
export const FilledCheckIcon = (props: any) => <Icon iconName="check" filled {...props} />;
export const LinkIcon = (props: any) => <Icon iconName="link" {...props} />;
export const ClipboardIcon = (props: any) => <Icon iconName="content_copy" {...props} />;
export const QuoteIcon = (props: any) => <Icon iconName="format_quote" {...props} />;
export const CheckCircleIcon = (props: any) => <Icon iconName="check_circle" filled {...props} />;
export const FilterIcon = (props: any) => <Icon iconName="filter_list" {...props} />;
export const CloseIcon = (props: any) => <Icon iconName="close" {...props} />;
export const WarningIcon = (props: any) => <Icon iconName="warning" {...props} />;
export const BarChartIcon = (props: any) => <Icon iconName="bar_chart" {...props} />;
export const TrendingUpIcon = (props: any) => <Icon iconName="trending_up" {...props} />;
export const SunnyIcon = (props: any) => <Icon iconName="wb_sunny" {...props} />;
export const TrophyIcon = (props: any) => <Icon iconName="emoji_events" {...props} />;
export const FlameIcon = (props: any) => <Icon iconName="local_fire_department" filled {...props} />;
export const SparkleIcon = (props: any) => <Icon iconName="auto_awesome" {...props} />;
export const CachedIcon = (props: any) => <Icon iconName="cached" {...props} />;
export const LightbulbIcon = (props: any) => <Icon iconName="lightbulb" filled {...props} />;
export const EditIcon = (props: any) => <Icon iconName="edit" {...props} />;
export const LogoutIcon = (props: any) => <Icon iconName="logout" {...props} />;
export const SelfImprovementIcon = (props: any) => <Icon iconName="self_improvement" {...props} />;
export const PsychologyIcon = (props: any) => <Icon iconName="psychology" {...props} />;
export const TargetIcon = (props: any) => <Icon iconName="ads_click" {...props} />;
export const BoltIcon = (props: any) => <Icon iconName="bolt" filled {...props} />;
export const StarIcon = (props: any) => <Icon iconName="star" filled {...props} />;
export const EmailIcon = (props: any) => <Icon iconName="mail" {...props} />;
export const PhoneIcon = (props: any) => <Icon iconName="phone" {...props} />;
export const DownloadIcon = (props: any) => <Icon iconName="download" {...props} />;
export const HeartIcon = (props: any) => <Icon iconName="favorite" {...props} />;
export const ArrowRightIcon = (props: any) => <Icon iconName="arrow_forward" {...props} />;
export const BabyIcon = (props: any) => <Icon iconName="child_care" {...props} />;
