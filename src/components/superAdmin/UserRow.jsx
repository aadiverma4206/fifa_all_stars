import React from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { UserCheck, Shield, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

export const UserRow = ({ user, onRoleChange }) => {
  const handleToggleRole = () => {
    const nextRole = user.role === 'player' ? 'club_manager' : 'player';
    onRoleChange(user.id, nextRole);
    toast.success(`Role updated for ${user.name} to ${nextRole.toUpperCase()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl glass-card gap-4">
      <div className="flex items-center space-x-3">
        <Avatar src={user.avatar} size="md" status={user.status} />
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{user.name}</h4>
            <Badge variant={user.role === 'super_admin' ? 'purple' : user.role === 'club_manager' ? 'gold' : 'emerald'} size="sm">
              {user.role.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">{user.email} • Joined {user.joinedDate}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {user.role !== 'super_admin' && (
          <Button
            variant="outline"
            size="sm"
            icon={UserCheck}
            onClick={handleToggleRole}
          >
            {user.role === 'player' ? 'Promote to Manager' : 'Demote to Player'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserRow;
