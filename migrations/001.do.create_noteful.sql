DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS folders;

CREATE TABLE folders (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    modified TIMESTAMPTZ DEFAULT now() NOT NULL,
    content TEXT,
    folderid INTEGER REFERENCES folders(id) ON DELETE CASCADE NOT NULL
);


-- FOOTNOTE

-- folderId INTEGER REFERENCES folders(id) ON DELETE CASCADE NOT NULL

-- Unfortunately can't mimic Noteful JSON Server property name `folderid`
-- because PostgreSQL converts all table column names into lowercase,
-- so `folderId` would become `folderid`.