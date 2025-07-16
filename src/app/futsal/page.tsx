'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Member {
  name: string;
}

interface TimelineEntry {
  type: 'score';
  scorer: string;
  assist?: string;
  time: string;
}

interface Team {
  name: string;
  score: number;
  members: Member[];
  timeline: TimelineEntry[];
}

export default function FutsalDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newMemberNames, setNewMemberNames] = useState<{ [key: number]: string }>({});
  const [selectedScorers, setSelectedScorers] = useState<{ [key: number]: string }>({});
  const [selectedAssists, setSelectedAssists] = useState<{ [key: number]: string }>({});

  const addTeam = () => {
    if (!newTeamName.trim()) return;
    const newTeam: Team = {
      name: newTeamName,
      score: 0,
      members: [],
      timeline: [],
    };
    setTeams([...teams, newTeam]);
    setNewTeamName('');
  };

  const addMember = (teamIdx: number) => {
    const name = newMemberNames[teamIdx];
    if (!name?.trim()) return;
    const newTeams = [...teams];
    newTeams[teamIdx].members.push({ name });
    setTeams(newTeams);
    setNewMemberNames({ ...newMemberNames, [teamIdx]: '' });
  };

  const addScore = (teamIdx: number) => {
    const scorer = selectedScorers[teamIdx];
    if (!scorer) return;
    const assist = selectedAssists[teamIdx];
    const newTeams = [...teams];
    newTeams[teamIdx].score += 1;
    newTeams[teamIdx].timeline.push({
      type: 'score',
      scorer,
      assist,
      time: new Date().toLocaleTimeString(),
    });
    setTeams(newTeams);
  };

  return (
    <div className="p-4 space-y-4">
      {/* 팀 추가 UI */}
      <div className="flex space-x-2">
        <Input
          placeholder="팀 이름 입력"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
        />
        <Button onClick={addTeam}>팀 추가</Button>
      </div>

      {/* 팀 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team, idx) => (
          <Card key={idx} className="rounded-2xl shadow-xl">
            <CardContent className="space-y-4 p-4">
              <h2 className="text-xl font-bold text-center">{team.name}</h2>
              <div className="text-6xl text-center font-semibold">{team.score}</div>

              {/* 득점자/어시스트자 선택 */}
              <div className="space-y-2">
                <Select onValueChange={(value) => setSelectedScorers({ ...selectedScorers, [idx]: value })}>
                  <SelectTrigger><SelectValue placeholder="득점자 선택" /></SelectTrigger>
                  <SelectContent>
                    {team.members.map((m, i) => (
                      <SelectItem key={i} value={m.name}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => setSelectedAssists({ ...selectedAssists, [idx]: value })}>
                  <SelectTrigger><SelectValue placeholder="어시스트자 선택 (선택)" /></SelectTrigger>
                  <SelectContent>
                    {team.members.map((m, i) => (
                      <SelectItem key={i} value={m.name}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="w-full" onClick={() => addScore(idx)}>
                  득점 기록
                </Button>
              </div>

              {/* 멤버 추가 */}
              <div className="space-y-2">
                <Input
                  placeholder="멤버 이름 입력"
                  value={newMemberNames[idx] || ''}
                  onChange={(e) => setNewMemberNames({ ...newMemberNames, [idx]: e.target.value })}
                />
                <Button className="w-full" variant="secondary" onClick={() => addMember(idx)}>
                  멤버 추가
                </Button>
              </div>

              {/* 타임라인 */}
              <div className="h-40 overflow-y-auto border-t pt-2 text-sm">
                <h3 className="font-semibold mb-1">타임라인</h3>
                {team.timeline.map((entry, i) => (
                  <div key={i} className="border-b py-1">
                    {entry.scorer} 득점
                    {entry.assist ? ` (어시스트: ${entry.assist})` : ''} - {entry.time}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
