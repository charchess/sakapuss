import React from 'react';
import { render } from '@testing-library/react-native';
import { EventCard } from '../../src/components/EventCard';

const baseEvent = {
  id: 'e1',
  pet_id: 'p1',
  type: 'weight',
  occurred_at: '2026-04-18T10:00:00Z',
  payload: { grams: 4200 },
};

describe('EventCard', () => {
  it("renders 'Pesée' label for type 'weight'", () => {
    const { getByText } = render(<EventCard event={baseEvent} />);
    expect(getByText('Pesée')).toBeTruthy();
  });

  it("renders 'Litière nettoyée' for type 'litter_clean'", () => {
    const event = { ...baseEvent, type: 'litter_clean', payload: {} };
    const { getByText } = render(<EventCard event={event} />);
    expect(getByText('Litière nettoyée')).toBeTruthy();
  });

  it("renders payload summary: for weight event with { grams: 4200 }, shows '4200 g'", () => {
    const { getByText } = render(<EventCard event={baseEvent} />);
    expect(getByText('4200 g')).toBeTruthy();
  });

  it("renders pet name when showPetName=true and event has pet_name", () => {
    const event = { ...baseEvent, pet_name: 'Luna' };
    const { getByText } = render(<EventCard event={event} showPetName={true} />);
    expect(getByText('Luna')).toBeTruthy();
  });

  it("does NOT render pet name when showPetName=false", () => {
    const event = { ...baseEvent, pet_name: 'Luna' };
    const { queryByText } = render(<EventCard event={event} showPetName={false} />);
    expect(queryByText('Luna')).toBeNull();
  });

  it("does NOT render pet name when pet_name is undefined", () => {
    const { queryByText } = render(<EventCard event={baseEvent} showPetName={true} />);
    expect(queryByText('Luna')).toBeNull();
  });
});
