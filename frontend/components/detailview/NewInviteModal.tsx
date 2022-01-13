import { useEffect, useState } from 'react';
import { createInvite } from '../../utils/routes/invite';
import Button from '../ui/Button';

import Modal from '../ui/Modal';
import { useRouter } from 'next/router';

type NewInviteModalProps = {
  groupId: string;
  isOpen: boolean;
  closeModal: () => void;
  openModal: () => void;
};

const NewInviteModal: React.FC<NewInviteModalProps> = ({ groupId, isOpen, closeModal, openModal }) => {
  const [error, setError] = useState<boolean>(false);
  const [invite, setInvite] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    if (groupId) {
      createInvite(groupId)
        .then((res) => {
          if (mounted && res.status === 200) {
            setInvite(process.env.NEXT_PUBLIC_URL + '/app/invite/' + res.data);
          } else {
            setError(true);
          }
        })
        .catch((_) => {
          setError(true);
        });
    }
    return () => {
      mounted = false;
    };
  }, [groupId, isOpen]);

  return (
    <Modal isOpen={isOpen} title="New Invite" closeHandler={closeModal} openHandler={openModal}>
      {error ? (
        <h3>Error generating your invite link. Please try again later.</h3>
      ) : invite === '' ? (
        <h3>Generating your Invite Link!</h3>
      ) : (
        <div>
          <h3 className="pb-2">Send this invite to your friends to add them to the group </h3>
          <div className="flex flex-row space-x-5">
            <input
              disabled
              className="dark:bg-slate-700 bg-white appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-200 dark:border-slate-400 placeholder-gray-500 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-slate-400 focus:z-10"
              value={invite}
            ></input>
            <button className="hover:text-violet-500" onClick={() => navigator.clipboard.writeText(invite)}>
              Copy
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default NewInviteModal;
