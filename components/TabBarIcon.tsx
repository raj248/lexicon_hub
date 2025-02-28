import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export const TabBarIcon = (props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
}) => {
  return <MaterialCommunityIcons size={28} className='' {...props} />;
};