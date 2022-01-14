import { useEffect, useState } from 'react';

import type { NextPage } from 'next/types';
import ReactLoading from 'react-loading';
import { acceptInviteToGroup } from '../../../utils/routes/invite';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

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
            router.push(`/app/group/${res.data}`);
          } else {
            setSuccess(false);
            setStatus(res.data);
            // router.push('/');
          }
        })
        .catch((err) => {
          setSuccess(false);
          setStatus(err.message);
          // router.push('/');
        });
    }
  }, [inviteCode]);

  return (
    <>
      <Head>
        <title>WheresMyMoney</title>
      </Head>
      <div className="flex flex-row bg-white dark:bg-slate-800 text-neutral-800 dark:text-slate-400 h-screen w-full font-default">
        <div className="flex flex-row w-full justify-center overflow-y-auto">
          <div className="flex flex-col space-y-10 w-11/12 items-center place-content-center">
            <h3 className="ml-3 text-3xl font-medium text-gray-500 dark:text-slate-400 text-left">
              {success === null ? (
                <ReactLoading type="spin" color="#9c3aed" height="100px" width="100px" />
              ) : success ? (
                'You have successfully accepted the invite!'
              ) : (
                <div>
                  <div>Sorry, the invite didn't work due to: {status}</div>
                    <span>
                      Please register at:  
                    </span>
                    <span className="text-violet-600 hover:text-violet-500">
                      <Link href='/'> wheresmymoney.one</Link>
                    </span>
                </div>
              )}
            </h3>
          </div>
        </div>
      </div>
    </>
  );
};

export default AcceptInvite;
