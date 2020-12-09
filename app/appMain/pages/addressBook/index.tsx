import './styles.scss';

import React from 'react';
import Groups from './groups';

export type Props = {};

const AddressBook: React.ComponentType<Props> = () => {
  return (
    <div className="module-addressbook">
      <div className="module-addressbook-list">
        <Groups />
      </div>
    </div>
  );
};

export default AddressBook;
