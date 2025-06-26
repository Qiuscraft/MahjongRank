export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const search_name = query.search_name || '';
  try {
    const searchQuery = search_name 
      ? { name: { $regex: search_name, $options: 'i' } }
      : {};
    
    return PlayerSchema.find(searchQuery).select('-__v')
  } catch (error) {
    console.error('Error fetching players:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Unknown Error'
    });
  }
})
