import type { NextPage } from 'next/types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { acceptInviteToGroup } from '../../../utils/routes/invite';
import ReactLoading from 'react-loading';

const AcceptInvite: NextPage = () => {
  const router = useRouter();
  const { inviteCode } = router.query;
  const [success, setSuccess] = useState<boolean | null>(null);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (typeof inviteCode === 'string') {
      acceptInviteToGroup(inviteCode)
        .then((res) => {
          if (res.status === 200) {
            setSuccess(true);
          } else {
            setSuccess(false);
            setStatus(res.data.message);
          }
        })
        .catch((err) => {
          setSuccess(false);
          setStatus(err.message);
        });
    }
  }, [inviteCode]);

  return (
    <div className="flex flex-row bg-white dark:bg-slate-800 text-neutral-800 dark:text-slate-400 h-screen w-full">
      <div className="flex flex-row w-full justify-center overflow-y-auto">
        <div className="flex flex-col space-y-10 w-11/12 items-center place-content-center">
          <h3 className="ml-3 text-3xl font-medium text-gray-500 dark:text-slate-400 text-left">
            {success === null ? (
              <ReactLoading type="spin" color="#9c3aed" height="100px" width="100px" />
            ) : success ? (
              'You have successfully accepted the invite!'
            ) : (
              "Sorry, the invite didn't work due to: " + status
            )}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;
