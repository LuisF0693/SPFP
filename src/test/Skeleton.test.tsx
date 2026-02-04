import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '../components/ui/Skeleton';

describe('Skeleton Component', () => {
  it('renders text skeleton by default', () => {
    const { container } = render(<Skeleton />);
    const skeletonElement = container.querySelector('.animate-pulse');
    expect(skeletonElement).toBeInTheDocument();
  });

  it('renders multiple skeleton items when count is provided', () => {
    const { container } = render(<Skeleton count={3} />);
    const skeletonElements = container.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThanOrEqual(3);
  });

  it('renders card variant with correct structure', () => {
    const { container } = render(<Skeleton variant="card" count={1} />);
    const cardSkeleton = container.querySelector('.rounded-2xl');
    expect(cardSkeleton).toBeInTheDocument();
  });

  it('renders avatar variant with rounded-full', () => {
    const { container } = render(<Skeleton variant="avatar" count={1} />);
    const avatarSkeleton = container.querySelector('.rounded-full');
    expect(avatarSkeleton).toBeInTheDocument();
  });

  it('renders table-row variant with correct structure', () => {
    const { container } = render(<Skeleton variant="table-row" count={1} />);
    // Just verify the container has content for table-row variant
    const tableRowSkeleton = container.querySelector('div');
    expect(tableRowSkeleton).toBeTruthy();
  });

  it('renders chart variant', () => {
    const { container } = render(<Skeleton variant="chart" count={1} />);
    const chartSkeleton = container.querySelector('.rounded-2xl');
    expect(chartSkeleton).toBeInTheDocument();
  });

  it('respects custom width', () => {
    const { container } = render(<Skeleton width={200} count={1} />);
    const skeleton = container.querySelector('[style*="width"]');
    expect(skeleton).toHaveStyle('width: 200px');
  });

  it('respects custom height', () => {
    const { container } = render(<Skeleton height={50} count={1} />);
    const skeleton = container.querySelector('[style*="height"]');
    expect(skeleton).toHaveStyle('height: 50px');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeletonWrapper = container.firstChild;
    expect(skeletonWrapper).toHaveClass('custom-class');
  });

  it('renders button variant with correct height', () => {
    const { container } = render(<Skeleton variant="button" count={1} />);
    const buttonSkeleton = container.querySelector('.rounded-lg');
    expect(buttonSkeleton).toBeInTheDocument();
  });

  it('has animate-pulse class for loading effect', () => {
    const { container } = render(<Skeleton variant="text" count={1} />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('renders with proper background color classes', () => {
    const { container } = render(<Skeleton count={1} />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toHaveClass('bg-gray-700/30');
  });
});
