import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
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

  it('shows action buttons when onComplete and onPostpone are provided', () => {
    const { getByText } = render(
      <ReminderCard reminder={pastReminder} onComplete={jest.fn()} onPostpone={jest.fn()} />
    );
    expect(getByText('✅ Fait')).toBeTruthy();
    expect(getByText('⏭️ +7j')).toBeTruthy();
  });

  it('calls onComplete when Fait is pressed', () => {
    const onComplete = jest.fn();
    const { getByText } = render(
      <ReminderCard reminder={pastReminder} onComplete={onComplete} onPostpone={jest.fn()} />
    );
    fireEvent.press(getByText('✅ Fait'));
    expect(onComplete).toHaveBeenCalledWith('r1');
  });

  it('calls onPostpone when +7j is pressed', () => {
    const onPostpone = jest.fn();
    const { getByText } = render(
      <ReminderCard reminder={pastReminder} onComplete={jest.fn()} onPostpone={onPostpone} />
    );
    fireEvent.press(getByText('⏭️ +7j'));
    expect(onPostpone).toHaveBeenCalledWith('r1', 7);
  });

  it('does not show action buttons when callbacks are not provided', () => {
    const { queryByText } = render(<ReminderCard reminder={pastReminder} />);
    expect(queryByText('✅ Fait')).toBeNull();
    expect(queryByText('⏭️ +7j')).toBeNull();
  });
});
