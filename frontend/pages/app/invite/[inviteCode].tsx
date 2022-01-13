import type { NextPage } from 'next/types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { acceptInviteToGroup } from '../../../utils/routes/invite';
import Sidebar from '../../../components/app/Sidebar';
import ReactLoading from 'react-loading';

const AcceptInvite: NextPage = () => {
  const router = useRouter();
  const { inviteCode } = router.query;
  const [success, setSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    console.log(inviteCode);
    if (typeof inviteCode === 'string') {
      acceptInviteToGroup(inviteCode)
        .then((res) => {
          if (res.status === 200) {
            setSuccess(true);
          } else {
            setSuccess(false);
          }
        })
        .catch((err) => {
          setSuccess(false);
        });
    }
  }, [inviteCode]);

  return (
    <div className="flex flex-row bg-white dark:bg-slate-800 text-neutral-800 dark:text-slate-400 h-screen w-full">
      <div className="flex flex-row w-full justify-center overflow-y-auto">
        <div className="flex flex-col space-y-10 w-11/12 items-center">
          <h3 className="ml-3 text-md font-medium text-gray-500 dark:text-slate-400 text-left">
            {success === null ? (
              <ReactLoading type="spin" color="#9c3aed" height="50px" width="50px" />
            ) : success ? (
              'You have successfully accepted the invite!'
            ) : (
              "Sorry, the invite didn't work.  Please check if you are logged in and try again."
            )}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;
