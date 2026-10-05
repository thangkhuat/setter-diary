# Permissions Matrix

All access is scoped to the team being viewed. Team administration belongs to team managers, separate from playing roles; no one outside a team sees its data. One account can belong to several teams with a role in each; a team may have several setters; a player may hold both roles in one team.

| User | Can log | Can view |
| --- | --- | --- |
| Setter | Their own sets, with full detail; their own sessions (players involved, positions) | Their own diary only: progress across their hitters and set types, including each hitter's overall rating of their sets. Never another setter's diary |
| Hitter (teammate) | One overall 0–3 rating per session for the sets they received from that setter | Own progress (v1: quality of sets they received); each team setter's consistency trend; own row of each setter's hitter × set-type grid. Never other hitters' data |
| Team manager (any member, on top of their role) | Team roster and invite links; set-type list; grant or revoke team-wide view; make other members managers | As their role, plus the roster |
| Member with team-wide view (setter or hitter) | As their role | All of their team's stats: every setter's diary and every hitter's data |
| Setter, AI discussion (FR-14) | Start and continue own AI conversations; connect own Claude account | Own AI conversations only. No one else, including team-wide view holders, can see them |
| Any user | Join a team via invite link; delete own account (data anonymised, kept); export own data as CSV | Their own teams only |

A player removed from a team loses access to its data; their history stays with the team.
