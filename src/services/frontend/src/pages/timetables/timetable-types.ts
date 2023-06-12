export type Room = {
  uid: string;
  name: string;
};

export type Teacher = {
  uid: string;
  name: string;
};

export type Subject = {
  uid: string;
  name: string;
};

export type Lesson = {
  uid: string;
};

export type Class = {
  uid: string;
  name: string;
  lessons: Lesson[];
};

export type TimetableFlat = {
  uid: string;
  name: string;
};

export type TimetableDeep = {
  uid: string;
  rooms: Room[];
  teachers: Teacher[];
  subjects: Subject[];
  classes: Class[];
};
