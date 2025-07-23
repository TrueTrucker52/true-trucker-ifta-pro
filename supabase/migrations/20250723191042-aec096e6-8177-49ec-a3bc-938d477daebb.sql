-- Drop and recreate the trigger for user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();