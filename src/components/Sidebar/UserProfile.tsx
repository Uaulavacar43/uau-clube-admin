import { Avatar, AvatarImage} from '../ui/Avatar';

interface UserProfileProps {
  name: string;
  role: string;
  onProfileClick: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ name, role, onProfileClick }) => {
  return (
    <div className="flex items-center gap-3 cursor-pointer" onClick={onProfileClick}>
      <Avatar className="w-10 h-10">
        <AvatarImage src="/user.svg" alt={name} />
       
      </Avatar>
      <div>
        <p className="font-medium text-white text-xl">{name}</p>
        <p className="text-xs text-white/70">{role}</p>
      </div>
    </div>
  );
};

export default UserProfile;
