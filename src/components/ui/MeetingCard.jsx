import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const MeetingCard = ({ meeting }) => {
  return (
    <Card className="animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 mt-1">
            <AvatarImage src={meeting.avatar} alt={meeting.contact} />
            <AvatarFallback className="bg-brand-black text-white w-full h-full flex items-center justify-center rounded-full">
              {meeting.contact.split(' ').map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-medium">{meeting.contact}</h3>
                <p className="text-xs text-muted-foreground">{meeting.company}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    meeting.type === "Incoming"
                      ? "secondary"
                      : meeting.type === "Scheduled"
                      ? "outline"
                      : "default"
                  }
                >
                  {meeting.type}
                </Badge>
                <Badge
                  variant={meeting.status === "Completed" ? "secondary" : "default"}
                >
                  {meeting.status}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
              <div>Date: {meeting.date}</div>
              <div>Time: {meeting.time}</div>
              <div>Duration: {meeting.duration}</div>
            </div>

            {meeting.notes && (
              <>
                <Separator className="my-2" />
                <p className="text-sm">{meeting.notes}</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeetingCard;
