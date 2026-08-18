import React from 'react';
import tacoAvatar from '../assets/images/avatar-taco.png';
import sushiAvatar from '../assets/images/avatar-sushi.png';

export const FOOD_AVATARS = [
  { id: 'taco', label: 'Taco', image: tacoAvatar },
  { id: 'sushi', label: 'Sushi', image: sushiAvatar },
];

export function FoodAvatar({ avatar = 'taco', className = '', alt = 'Food avatar' }) {
  const selected = avatar === 'sushi' ? 'sushi' : 'taco';
  const option = FOOD_AVATARS.find((item) => item.id === selected);
  return <span className={`food-avatar food-avatar-${selected} ${className}`} role="img" aria-label={alt}><img className="food-avatar-image" src={option.image} alt="" aria-hidden="true" /></span>;
}
