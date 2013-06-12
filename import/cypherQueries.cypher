*** Global query that updates link relevances (times out in console) ***

START root = node(*) 
MATCH (root)-->(link)-->(friend)
WHERE root.nodeType! = "kn_Post" 
  AND link.nodeType! = "kn_Edge"
  AND friend.nodeType! = "kn_Post"
WITH root, link, friend

MATCH (root)-->(linkA)-->(common)-->(linkB)-->(friend)
WHERE 
  linkA.nodeType! = "kn_Edge"
  AND common.nodeType! = "kn_Post" 
  AND linkB.nodeType! = "kn_Edge"
WITH root, link, friend, count(DISTINCT common) as commonCount

MATCH (root)-->(linkC)-->(other)
WHERE 
  linkC.nodeType! = "kn_Edge"
  AND other.nodeType! = "kn_Post" 
WITH root, link, friend, commonCount, count(DISTINCT other) as totalCount

SET link.relevance = commonCount * 1.0 / totalCount

RETURN root, friend, commonCount, totalCount, commonCount * 1.0 / totalCount as strength 


*** With limits to avoid timeout ***

START root = node(*) 
MATCH (root)-->(link)-->(friend)
WHERE root.nodeType! = "kn_Post" 
  AND link.nodeType! = "kn_Edge"
  AND friend.nodeType! = "kn_Post"
  AND id(root) >= 500
  AND id(root) < 1000
WITH root, link, friend

MATCH (root)-->(linkA)-->(common)-->(linkB)-->(friend)
WHERE 
  linkA.nodeType! = "kn_Edge"
  AND common.nodeType! = "kn_Post" 
  AND linkB.nodeType! = "kn_Edge"
WITH root, link, friend, count(DISTINCT common) as commonCount

MATCH (root)-->(linkC)-->(other)
WHERE 
  linkC.nodeType! = "kn_Edge"
  AND other.nodeType! = "kn_Post" 
WITH root, link, friend, commonCount, count(DISTINCT other) as totalCount

SET link.relevance = commonCount * 1.0 / totalCount

RETURN root, friend, commonCount, totalCount, commonCount * 1.0 / totalCount as strength
