import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';

import { DarkmodeContext } from '../../pages/_app';

type ModalProps = {
  isOpen: boolean;
  title: string;
  closeHandler: () => void;
  openHandler: () => void;
};

const Modal: React.FC<ModalProps> = ({ isOpen, closeHandler, openHandler, title, children }) => {
  return (
    <DarkmodeContext.Consumer>
      {(darkmodeProps) => {
        return (
          <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="font-default fixed inset-0 z-10 overflow-y-auto" onClose={closeHandler}>
              <div className={`${darkmodeProps.isDarkmode ? 'dark' : ''} min-h-screen px-4 text-center`}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Dialog.Overlay className="fixed inset-0 backdrop-filter backdrop-blur-sm backdrop-brightness-50" />
                </Transition.Child>

                {/* This element is to trick the browser into centering the modal contents. */}
                <span className="inline-block h-screen align-middle" aria-hidden="true">
                  &#8203;
                </span>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <div className="dark:bg-slate-900 inline-block w-full max-w-xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
                    <Dialog.Title as="h3" className="dark:text-gray-100 text-lg font-semibold leading-6 text-gray-900">
                      {title}
                    </Dialog.Title>
                    <div className="mt-3">{children}</div>
                  </div>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition>
        );
      }}
    </DarkmodeContext.Consumer>
  );
};

export default Modal;
