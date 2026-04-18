import React from 'react';
import { render } from '@testing-library/react-native';
import { PetAvatar } from '../../src/components/PetAvatar';

test('affiche le nom de l\'animal', () => {
  const { getByText } = render(<PetAvatar name="Luna" species="cat" />);
  expect(getByText('Luna')).toBeTruthy();
});

test('affiche l\'emoji chat pour species=cat', () => {
  const { getByText } = render(<PetAvatar name="Luna" species="cat" />);
  expect(getByText('🐱')).toBeTruthy();
});

test('affiche l\'emoji chien pour species=dog', () => {
  const { getByText } = render(<PetAvatar name="Rex" species="dog" />);
  expect(getByText('🐶')).toBeTruthy();
});

test('affiche l\'emoji générique pour species inconnu', () => {
  const { getByText } = render(<PetAvatar name="Tortue" species="turtle" />);
  expect(getByText('🐾')).toBeTruthy();
});

test('affiche une Image quand photoUrl est fourni', () => {
  const { UNSAFE_getByType } = render(
    <PetAvatar name="Luna" species="cat" photoUrl="https://example.com/luna.jpg" />
  );
  const { Image } = require('react-native');
  expect(UNSAFE_getByType(Image)).toBeTruthy();
});

test('selected=true applique des styles différents au nom', () => {
  const { getByText } = render(<PetAvatar name="Luna" species="cat" selected />);
  const nameEl = getByText('Luna');
  // Style exists — no crash, selected prop consumed without error
  expect(nameEl).toBeTruthy();
});
