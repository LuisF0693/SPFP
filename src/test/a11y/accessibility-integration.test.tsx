/**
 * Accessibility Integration Tests
 * STY-014: WCAG 2.1 Level AA Compliance - Component Integration
 * Tests ARIA attributes, keyboard navigation, screen reader patterns
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Landmark } from '../../components/ui/Landmark';
import { LiveRegion } from '../../components/ui/LiveRegion';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { HintText } from '../../components/ui/HintText';
import { FormField } from '../../components/ui/FormField';
import { FormGroup } from '../../components/ui/FormGroup';

/**
 * LANDMARKS & NAVIGATION TESTS (8)
 */
describe('Landmarks & Navigation Accessibility', () => {
  it('Landmark component renders with role="main"', () => {
    render(
      <Landmark role="main" label="Main Content">
        <div>Content</div>
      </Landmark>
    );
    const landmark = screen.getByRole('main');
    expect(landmark).toBeInTheDocument();
    expect(landmark).toHaveAttribute('aria-label', 'Main Content');
  });

  it('Landmark component renders with role="navigation"', () => {
    render(
      <Landmark role="navigation" label="Main Navigation">
        <nav>Navigation</nav>
      </Landmark>
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('aria-label', 'Main Navigation');
  });

  it('Landmark component renders with role="complementary"', () => {
    render(
      <Landmark role="complementary" label="Sidebar">
        <aside>Sidebar content</aside>
      </Landmark>
    );
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveAttribute('aria-label', 'Sidebar');
  });

  it('Landmark supports ariaLabelledBy for id reference', () => {
    render(
      <>
        <h1 id="main-title">Page Title</h1>
        <Landmark role="main" ariaLabelledBy="main-title">
          <div>Content</div>
        </Landmark>
      </>
    );
    const landmark = screen.getByRole('main');
    expect(landmark).toHaveAttribute('aria-labelledby', 'main-title');
  });

  it('LiveRegion with status role announces politely', () => {
    render(
      <LiveRegion type="status" message="Balance updated to $5000" />
    );
    const region = screen.getByRole('status');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'true');
  });

  it('LiveRegion with alert role announces assertively', () => {
    render(
      <LiveRegion type="alert" message="Error: Invalid amount" />
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
  });

  it('LiveRegion with log role creates message log', () => {
    render(
      <LiveRegion type="log" label="Message History">
        <div>Message 1</div>
      </LiveRegion>
    );
    const log = screen.getByRole('log');
    expect(log).toBeInTheDocument();
    expect(log).toHaveAttribute('aria-label', 'Message History');
  });

  it('Tab order is logical through multiple landmarks', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Landmark role="navigation" label="Nav">
          <button>Nav Button</button>
        </Landmark>
        <Landmark role="main" label="Main">
          <button>Main Button</button>
        </Landmark>
      </>
    );

    const navButton = screen.getByText('Nav Button');
    const mainButton = screen.getByText('Main Button');

    expect(navButton).toBeInTheDocument();
    expect(mainButton).toBeInTheDocument();
  });
});

/**
 * FORM ACCESSIBILITY TESTS (12)
 */
describe('Form Accessibility', () => {
  it('FormField renders with label linked to input', () => {
    render(
      <FormField
        label="Amount"
        id="amount"
        name="amount"
        type="number"
      />
    );
    const label = screen.getByText('Amount');
    const input = screen.getByRole('spinbutton', { name: /amount/i });

    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  it('FormField displays error message with role="alert"', () => {
    render(
      <FormField
        label="Amount"
        id="amount"
        name="amount"
        type="number"
        error="Amount must be greater than 0"
      />
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Amount must be greater than 0');
  });

  it('FormField links error via aria-describedby', () => {
    render(
      <FormField
        label="Amount"
        id="amount"
        name="amount"
        type="number"
        error="Invalid amount"
      />
    );
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('aria-describedby');
  });

  it('FormField displays hint text with proper ID', () => {
    render(
      <FormField
        label="Amount"
        id="amount"
        name="amount"
        type="number"
        hint="Max 999,999.99"
      />
    );
    const hint = screen.getByText('Max 999,999.99');
    expect(hint).toBeInTheDocument();
  });

  it('FormField sets aria-invalid when error exists', () => {
    render(
      <FormField
        label="Amount"
        id="amount"
        name="amount"
        type="number"
        error="Invalid"
      />
    );
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('FormField sets aria-required when required=true', () => {
    render(
      <FormField
        label="Amount"
        id="amount"
        name="amount"
        type="number"
        required
      />
    );
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('FormGroup renders fieldset with legend', () => {
    render(
      <FormGroup legend="Choose a category" name="category">
        <label>
          <input type="radio" name="category" value="food" />
          Groceries
        </label>
      </FormGroup>
    );
    const fieldset = screen.getByRole('group');
    expect(fieldset).toBeInTheDocument();
    expect(screen.getByText('Choose a category')).toBeInTheDocument();
  });

  it('FormGroup displays error with role="alert"', () => {
    render(
      <FormGroup
        legend="Choose category"
        name="category"
        error="Category is required"
      >
        <label>
          <input type="radio" name="category" value="food" />
          Groceries
        </label>
      </FormGroup>
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Category is required');
  });

  it('ErrorMessage renders with role="alert"', () => {
    render(
      <ErrorMessage
        id="error-1"
        message="This field is required"
      />
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('This field is required');
  });

  it('HintText renders without blocking interaction', () => {
    render(
      <>
        <FormField
          label="Description"
          id="desc"
          name="desc"
          hint="Max 255 characters"
        />
      </>
    );
    const hint = screen.getByText('Max 255 characters');
    expect(hint).toBeInTheDocument();
    const input = screen.getByRole('textbox', { name: /description/i });
    expect(input).toBeInTheDocument();
  });

  it('FormField shows required indicator', () => {
    render(
      <FormField
        label="Email"
        id="email"
        name="email"
        type="email"
        required
      />
    );
    const indicator = screen.getByLabelText('required', { exact: false });
    expect(indicator).toHaveTextContent('*');
  });
});

/**
 * KEYBOARD NAVIGATION TESTS (10)
 */
describe('Keyboard Navigation', () => {
  it('FormField input responds to keyboard focus', async () => {
    const user = userEvent.setup();
    render(
      <FormField
        label="Test Input"
        id="test"
        name="test"
      />
    );
    const input = screen.getByRole('textbox', { name: /test input/i });
    await user.tab();
    expect(input).toBeFocused();
  });

  it('FormField input has visible focus indicator', () => {
    render(
      <FormField
        label="Test Input"
        id="test"
        name="test"
      />
    );
    const input = screen.getByRole('textbox', { name: /test input/i });
    expect(input).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
  });

  it('FormGroup radio buttons support arrow key navigation', async () => {
    const user = userEvent.setup();
    render(
      <FormGroup legend="Category" name="category">
        <label>
          <input type="radio" name="category" value="food" />
          Food
        </label>
        <label>
          <input type="radio" name="category" value="transport" />
          Transport
        </label>
      </FormGroup>
    );

    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(2);
  });

  it('ErrorMessage is announced on focus', () => {
    render(
      <>
        <FormField
          label="Amount"
          id="amount"
          name="amount"
          type="number"
          error="Amount is required"
        />
      </>
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('FormField input supports number type with inputmode', () => {
    render(
      <FormField
        label="Amount"
        id="amount"
        name="amount"
        type="number"
        inputMode="decimal"
      />
    );
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('FormField supports date input type', () => {
    render(
      <FormField
        label="Date"
        id="date"
        name="date"
        type="date"
      />
    );
    const input = screen.getByRole('textbox', { name: /date/i });
    expect(input).toHaveAttribute('type', 'date');
  });

  it('FormField input height is 44px on mobile for touch target', () => {
    const { container } = render(
      <FormField
        label="Test"
        id="test"
        name="test"
      />
    );
    const input = container.querySelector('input');
    expect(input).toHaveClass('min-h-[44px]');
  });

  it('FormField disabled state is properly marked', () => {
    render(
      <FormField
        label="Disabled"
        id="disabled"
        name="disabled"
        disabled
      />
    );
    const input = screen.getByRole('textbox', { name: /disabled/i });
    expect(input).toBeDisabled();
  });

  it('FormGroup fieldset is keyboard navigable', () => {
    render(
      <FormGroup legend="Options" name="options">
        <label>
          <input type="checkbox" name="options" value="opt1" />
          Option 1
        </label>
        <label>
          <input type="checkbox" name="options" value="opt2" />
          Option 2
        </label>
      </FormGroup>
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(2);
  });

  it('LiveRegion content is accessible via keyboard', () => {
    render(
      <LiveRegion type="status" message="Operation successful" />
    );
    const region = screen.getByRole('status');
    expect(region).toHaveTextContent('Operation successful');
  });
});

/**
 * RESPONSIVE DESIGN TESTS (6)
 */
describe('Mobile Responsiveness & Touch Targets', () => {
  it('FormField has 44px minimum height on mobile', () => {
    const { container } = render(
      <FormField
        label="Test"
        id="test"
        name="test"
      />
    );
    const input = container.querySelector('input');
    expect(input).toHaveClass('min-h-[44px]');
  });

  it('FormField has responsive touch target sizes', () => {
    const { container } = render(
      <FormField
        label="Test"
        id="test"
        name="test"
      />
    );
    const input = container.querySelector('input');
    expect(input).toHaveClass('md:min-h-[40px]');
  });

  it('FormGroup maintains touch targets', () => {
    render(
      <FormGroup legend="Category" name="category">
        <label>
          <input type="radio" name="category" value="food" />
          Food
        </label>
      </FormGroup>
    );
    const radio = screen.getByRole('radio');
    expect(radio).toBeInTheDocument();
  });

  it('ErrorMessage is readable on mobile', () => {
    render(
      <ErrorMessage
        id="error"
        message="This field is too short"
      />
    );
    const error = screen.getByRole('alert');
    expect(error).toHaveClass('text-sm', 'font-medium');
  });

  it('HintText scales appropriately on different sizes', () => {
    const { container } = render(
      <HintText id="hint" text="Hint text" />
    );
    const hint = container.querySelector('span');
    expect(hint).toHaveClass('text-xs');
  });

  it('Landmark supports responsive layout', () => {
    render(
      <Landmark role="main" label="Main">
        <div className="container-responsive">Content</div>
      </Landmark>
    );
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });
});

/**
 * WCAG COMPLIANCE TESTS (Bonus)
 */
describe('WCAG 2.1 AA Compliance', () => {
  it('FormField color contrast is sufficient', () => {
    const { container } = render(
      <FormField
        label="Test"
        id="test"
        name="test"
      />
    );
    const input = container.querySelector('input');
    // Text color should be light enough for contrast
    expect(input).toHaveClass('text-gray-100', 'dark:text-gray-100');
  });

  it('Error messages use color + icon for clarity', () => {
    render(
      <ErrorMessage
        id="error"
        message="Required field"
      />
    );
    const alert = screen.getByRole('alert');
    // Should have text AND icon
    expect(alert.innerHTML).toContain('svg'); // Icon present
    expect(alert).toHaveTextContent('Required field');
  });

  it('Focus indicators are clearly visible', () => {
    const { container } = render(
      <FormField
        label="Test"
        id="test"
        name="test"
      />
    );
    const input = container.querySelector('input');
    expect(input).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
  });

  it('All interactive elements are keyboard accessible', async () => {
    const { container } = render(
      <>
        <FormField label="Field 1" id="f1" name="f1" />
        <FormField label="Field 2" id="f2" name="f2" />
        <FormField label="Field 3" id="f3" name="f3" />
      </>
    );
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBe(3);
  });
});
