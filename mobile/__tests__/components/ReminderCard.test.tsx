import React from 'react';
import { render } from '@testing-library/react-native';
import { ReminderCard } from '../../src/components/ReminderCard';

const pastReminder = {
  id: 'r1',
  pet_id: 'p1',
  pet_name: 'Luna',
  name: 'Vaccin rage',
  type: 'vaccine',
  next_due_date: '2020-01-01',
  status: 'overdue',
};

const todayReminder = {
  id: 'r2',
  pet_id: 'p1',
  pet_name: 'Luna',
  name: 'Check-up',
  type: 'vet',
  next_due_date: new Date().toISOString().split('T')[0],
  status: 'today',
};

const futureReminder = {
  id: 'r3',
  pet_id: 'p1',
  pet_name: 'Luna',
  name: 'Rappel futur',
  type: 'vet',
  next_due_date: '2099-12-31',
  status: 'upcoming',
};

describe('ReminderCard', () => {
  it("shows 'En retard' badge for past date", () => {
    const { getByText } = render(<ReminderCard reminder={pastReminder} />);
    expect(getByText('En retard')).toBeTruthy();
  });

  it("shows \"Aujourd'hui\" badge for today's date", () => {
    const { getByText } = render(<ReminderCard reminder={todayReminder} />);
    expect(getByText("Aujourd'hui")).toBeTruthy();
  });

  it("shows 'À venir' badge for future date", () => {
    const { getByText } = render(<ReminderCard reminder={futureReminder} />);
    expect(getByText('À venir')).toBeTruthy();
  });

  it('renders the reminder name', () => {
    const { getByText } = render(<ReminderCard reminder={pastReminder} />);
    expect(getByText('Vaccin rage')).toBeTruthy();
  });

  it('renders the pet name', () => {
    const { getByText } = render(<ReminderCard reminder={pastReminder} />);
    expect(getByText('Luna')).toBeTruthy();
  });
});
