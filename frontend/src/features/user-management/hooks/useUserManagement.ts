import { useUserList } from './useUserList';
import { useUserCsv } from './useUserCsv';
import { useInterviewerRegistration } from './useInterviewerRegistration';

export const useUserManagement = () => {
  const userList = useUserList();
  const userCsv = useUserCsv({
    searchParams: userList.searchParams,
    fetchUsers: userList.fetchUsers,
  });
  const interviewerRegistration = useInterviewerRegistration({
    fetchUsers: userList.fetchUsers,
    setError: userList.setError,
  });

  return {
    ...userList,
    ...userCsv,
    ...interviewerRegistration,
  };
};
